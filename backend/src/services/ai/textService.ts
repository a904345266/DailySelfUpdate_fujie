import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { OpenAiCompatibleProvider } from './openaiProvider';
import { ClaudeProvider } from './claudeProvider';
import type { AiProvider, ProviderName } from './types';

export type UserTier = 'free' | 'vip';
/** basic = 精简去冗余（人人可用）; polish = 提炼润色（VIP） */
export type RefineMode = 'basic' | 'polish';

export interface RefineResult {
  text: string; // 整理后的文本
  mode: RefineMode; // 实际采用的模式
  changed: boolean; // 是否与原文不同
}

function makeProvider(name: ProviderName): AiProvider {
  if (name === 'claude') return new ClaudeProvider();
  return new OpenAiCompatibleProvider(name);
}
function providerForTier(tier: UserTier): AiProvider {
  const name = tier === 'vip' ? env.AI_VIP_PROVIDER : env.AI_FREE_PROVIDER;
  return makeProvider(name);
}

const BASIC_SYSTEM = `你是一个中文文本整理助手。把用户口述/草草记下的内容整理得通顺简洁：
- 去掉口语赘词、重复、语气词（"嗯""那个""就是说"等）和无意义的填充。
- 保留全部关键信息和原意，不增删事实、不发挥、不润色文采。
- 保持朴素、第一人称的记录口吻。
- 只输出整理后的文本，不要解释、不要引号、不要 markdown。`;

const POLISH_SYSTEM = `你是一个中文写作润色助手。把用户口述/草草记下的内容提炼润色成一段优美流畅的记录：
- 先去掉赘词与重复，再让表达更凝练、有条理、有温度。
- 保留全部关键事实与真实感受，不编造、不夸大。
- 维持第一人称的个人记录视角，读起来自然走心。
- 只输出润色后的文本，不要解释、不要引号、不要 markdown。`;

/**
 * Refine a piece of text. tier=vip → polish (提炼润色); otherwise basic (精简去冗余).
 * Never throws: on AI disabled / unconfigured / failure → returns original text
 * with changed=false, so the UI can fall back gracefully.
 */
export async function refineText(
  raw: string,
  tier: UserTier
): Promise<RefineResult> {
  const text = raw.trim();
  const mode: RefineMode = tier === 'vip' ? 'polish' : 'basic';

  if (!text || !env.AI_ENABLED) return { text, mode, changed: false };

  const provider = providerForTier(tier);
  if (!provider.isConfigured()) return { text, mode, changed: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);
  try {
    const out = await provider.generate(
      {
        system: mode === 'polish' ? POLISH_SYSTEM : BASIC_SYSTEM,
        user: text,
      },
      controller.signal
    );
    // provider.generate returns string[] (parseInsights split); rejoin to text.
    const refined = (Array.isArray(out) ? out.join('\n') : String(out)).trim();
    if (!refined) return { text, mode, changed: false };
    return { text: refined, mode, changed: refined !== text };
  } catch (err) {
    logger.warn(`Text refine failed: ${err instanceof Error ? err.message : String(err)}`);
    return { text, mode, changed: false };
  } finally {
    clearTimeout(timer);
  }
}
