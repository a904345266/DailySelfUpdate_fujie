import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { WeeklyAnalysisResult } from '../analysisService';
import { OpenAiCompatibleProvider } from './openaiProvider';
import { ClaudeProvider } from './claudeProvider';
import type { AiProvider, ProviderName } from './types';

function makeTextProvider(name: ProviderName): AiProvider {
  if (name === 'claude') return new ClaudeProvider();
  return new OpenAiCompatibleProvider(name);
}

// Covers are written here and served at the matching public URL (see app.ts).
// Path is under /api/uploads so it rides the frontend's API base / Caddy proxy.
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'covers');
const PUBLIC_PREFIX = '/api/uploads/covers';

/**
 * Download a remote image to local disk and return its public path
 * (e.g. /uploads/covers/ab12.png). Returns null on failure.
 */
async function downloadToLocal(remoteUrl: string): Promise<string | null> {
  try {
    const res = await fetch(remoteUrl);
    if (!res.ok) throw new Error(`download HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = remoteUrl.includes('.jpg') || remoteUrl.includes('.jpeg') ? 'jpg' : 'png';
    const name = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
    return `${PUBLIC_PREFIX}/${name}`;
  } catch (err) {
    logger.warn(`Cover image download failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

/**
 * Fallback cover prompt from aggregate stats only (used when the LLM step-1
 * scene generation is unavailable). Abstract & aesthetic.
 */
function buildFallbackCoverPrompt(a: WeeklyAnalysisResult): string {
  const rating = a.emotional.avgOverallRating;
  let mood: string;
  if (rating === null) mood = '平和、留白、温柔的晨光';
  else if (rating >= 4) mood = '明亮、温暖、充满希望的金色阳光';
  else if (rating >= 3) mood = '宁静、柔和、舒适的自然光';
  else mood = '沉静、内省、淡蓝色的薄雾';

  const counts = {
    工作: a.totals.work,
    人际: a.totals.friend + a.totals.partner,
    感恩: a.totals.gratitude,
  };
  const topTheme = Object.entries(counts).sort((x, y) => y[1] - x[1])[0]?.[0] ?? '生活';
  const motif: Record<string, string> = {
    工作: '整洁的书桌、笔记本与一杯咖啡',
    人际: '温暖的人物剪影、相伴的氛围',
    感恩: '自然元素、植物、阳光下的窗台',
    生活: '简约的生活静物',
  };

  return [
    '一张治愈系、极简主义的插画风格封面图，适合作为每周个人成长总结的题图。',
    `画面氛围：${mood}。`,
    `主体意象：${motif[topTheme]}。`,
    '柔和的色彩、留白充足、温暖治愈、无任何文字、无水印，16:9 横向构图。',
  ].join('');
}

const SCENE_SYSTEM_PROMPT = `你是一位插画师的创意助理。用户会给你"某人这一周的真实生活记录摘录"。请把这一周的整体感觉，提炼成一段**适合文生图模型**的中文画面描述。

要求：
- 抓住本周最有代表性的真实场景与情绪基调（从记录里来，不要凭空编造）。
- 描述要具体、有画面感（地点、物件、光线、氛围），但保持治愈系、极简、温暖的插画风格。
- 画面里**不要出现任何文字、人脸特写或可识别的隐私信息**；用剪影、背影、静物、自然元素来表达。
- 只输出一段 50-120 字的画面描述本身，不要解释、不要加引号、不要列要点。`;

/**
 * Step 1 of two-step cover generation: ask the text model to read the week's
 * REAL excerpts and write a concrete scene description for the image model.
 * Returns null if unavailable, so caller falls back to the template prompt.
 */
async function buildCoverScene(a: WeeklyAnalysisResult): Promise<string | null> {
  const ex = a.excerpts;
  const all = [...ex.work, ...ex.friend, ...ex.partner, ...ex.gratitude, ...ex.reflection];
  if (all.length === 0) return null; // no real content → use template fallback

  // Reuse the configured text provider (GLM gateway etc.).
  const providerName: ProviderName = env.AI_VIP_PROVIDER || 'claude';
  const provider = makeTextProvider(providerName);
  if (!provider.isConfigured()) return null;

  const ratingNote =
    a.emotional.avgOverallRating !== null ? `本周整体心情评分 ${a.emotional.avgOverallRating}/5。` : '';
  const userPrompt = `${ratingNote}这是某人本周的真实记录摘录：\n${all.slice(0, 30).join('\n').slice(0, 1800)}\n\n请据此写一段画面描述。`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);
  try {
    const out = await provider.generate(
      { system: SCENE_SYSTEM_PROMPT, user: userPrompt },
      controller.signal
    );
    const scene = (Array.isArray(out) ? out.join(' ') : String(out)).trim();
    if (!scene) return null;
    return `一张治愈系、极简主义的插画风格封面图。画面：${scene}。柔和色彩、留白充足、温暖治愈、无任何文字、无水印，16:9 横向构图。`;
  } catch (err) {
    logger.warn(`Cover scene generation failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface CoverImageResult {
  url: string | null;
}

/**
 * Generate a cover image via an OpenAI-style /v1/images/generations endpoint.
 * Returns { url: null } on any failure / when disabled — never throws, so the
 * weekly summary always succeeds even if image generation is unavailable.
 */
export async function generateCoverImage(a: WeeklyAnalysisResult): Promise<CoverImageResult> {
  if (!env.IMAGE_ENABLED) return { url: null };
  if (!env.IMAGE_API_KEY) {
    logger.warn('IMAGE_ENABLED but IMAGE_API_KEY missing — skipping cover image');
    return { url: null };
  }

  // Step 1: let the text model turn the week's REAL content into a concrete
  // scene; fall back to the stats-only template if unavailable.
  const scenePrompt = (await buildCoverScene(a)) ?? buildFallbackCoverPrompt(a);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.IMAGE_TIMEOUT_MS);
  try {
    const client = new OpenAI({
      apiKey: env.IMAGE_API_KEY,
      ...(env.IMAGE_BASE_URL ? { baseURL: env.IMAGE_BASE_URL } : {}),
    });
    const res = await client.images.generate(
      {
        model: env.IMAGE_MODEL,
        prompt: scenePrompt,
        n: 1,
        size: env.IMAGE_SIZE as `${number}x${number}`,
      },
      { signal: controller.signal }
    );
    const remoteUrl = res.data?.[0]?.url ?? null;
    if (!remoteUrl) return { url: null };

    // The provider's URL expires (智谱 ~7d). Download it now and serve a stable
    // local copy so covers never break.
    const localPath = await downloadToLocal(remoteUrl);
    return { url: localPath ?? remoteUrl }; // fall back to remote URL if download fails
  } catch (err) {
    logger.warn(
      `Cover image generation failed (model=${env.IMAGE_MODEL}): ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return { url: null };
  } finally {
    clearTimeout(timer);
  }
}
