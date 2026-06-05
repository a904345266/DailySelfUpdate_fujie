import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export interface BookChapter {
  title: string;
  author: string;
  chapter: string;
  keyPoints: string;
}

export interface QuestionAiAnalysis {
  aiAnalysis: string;
  bookChapters: BookChapter[];
}

interface QuestionInput {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
  type: string;
}

const SYSTEM_PROMPT = `你是一位资深的心理学和哲学导师，擅长将日常问题与经典书籍理论联系起来，帮助用户获得深层次的成长洞见。

你的任务是：
1. 根据用户回答的每日打卡问题，提供一段个性化的深度分析（约200-300字），结合用户的选择进行剖析
2. 推荐 2-3 本与该问题高度相关的书籍，给出具体的章节名称和该章节的核心要点

请严格按照以下 JSON 格式返回，不要包含任何额外文字：
{
  "aiAnalysis": "深度分析内容...",
  "bookChapters": [
    {
      "title": "《书名》",
      "author": "作者名",
      "chapter": "第X章 章节名",
      "keyPoints": "该章节的核心要点摘要（50-100字）"
    }
  ]
}`;

function buildUserPrompt(question: QuestionInput, userAnswer: string): string {
  const isCorrect = userAnswer === question.answer;
  return `问题类型：${question.type === 'philosophy' ? '哲学思辨' : question.type === 'psychology' ? '心理洞察' : question.type === 'story' ? '故事启发' : '反思时刻'}
分类：${question.category}
问题：${question.question}
选项：${question.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(' | ')}
正确答案：${question.answer}
用户选择：${userAnswer}（${isCorrect ? '回答正确' : '回答错误'}）
基础解析：${question.explanation}

请基于以上信息，生成个性化的深度 AI 分析（结合用户的选择进行针对性分析），并推荐 2-3 本相关书籍的具体章节。`;
}

export async function generateQuestionAnalysis(
  question: QuestionInput,
  userAnswer: string
): Promise<QuestionAiAnalysis | null> {
  if (!env.AI_ENABLED || !env.DEEPSEEK_API_KEY) {
    return null;
  }

  const client = new OpenAI({
    apiKey: env.DEEPSEEK_API_KEY,
    baseURL: env.DEEPSEEK_BASE_URL,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);

  try {
    const res = await client.chat.completions.create(
      {
        model: env.DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(question, userAnswer) },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      { signal: controller.signal }
    );

    const content = res.choices[0]?.message?.content ?? '';
    return parseAnalysisResponse(content);
  } catch (err) {
    logger.warn(
      `AI question analysis failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseAnalysisResponse(raw: string): QuestionAiAnalysis | null {
  const trimmed = raw.trim();
  try {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end <= start) return null;

    const parsed = JSON.parse(trimmed.slice(start, end + 1));
    if (!parsed.aiAnalysis || !Array.isArray(parsed.bookChapters)) return null;

    return {
      aiAnalysis: String(parsed.aiAnalysis),
      bookChapters: parsed.bookChapters
        .slice(0, 3)
        .map((b: Record<string, unknown>) => ({
          title: String(b.title ?? ''),
          author: String(b.author ?? ''),
          chapter: String(b.chapter ?? ''),
          keyPoints: String(b.keyPoints ?? ''),
        }))
        .filter((b: BookChapter) => b.title && b.chapter),
    };
  } catch {
    logger.warn('Failed to parse AI question analysis response');
    return null;
  }
}
