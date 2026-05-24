import OpenAI from 'openai';
import { env } from '../../config/env';
import { AiProvider, InsightRequest, ProviderName, parseInsights } from './types';

/**
 * Works for any OpenAI Chat-Completions-compatible endpoint:
 * OpenAI itself, DeepSeek, 中转网关, local Ollama, etc.
 */
export class OpenAiCompatibleProvider implements AiProvider {
  readonly name: ProviderName;
  private apiKey?: string;
  private baseURL: string;
  private model: string;

  constructor(name: 'openai' | 'deepseek') {
    this.name = name;
    if (name === 'deepseek') {
      this.apiKey = env.DEEPSEEK_API_KEY;
      this.baseURL = env.DEEPSEEK_BASE_URL;
      this.model = env.DEEPSEEK_MODEL;
    } else {
      this.apiKey = env.OPENAI_API_KEY;
      this.baseURL = env.OPENAI_BASE_URL;
      this.model = env.OPENAI_MODEL;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generate(req: InsightRequest, signal: AbortSignal): Promise<string[]> {
    const client = new OpenAI({ apiKey: this.apiKey, baseURL: this.baseURL });
    const res = await client.chat.completions.create(
      {
        model: this.model,
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
        temperature: 0.7,
        max_tokens: 900,
      },
      { signal }
    );
    const content = res.choices[0]?.message?.content ?? '';
    return parseInsights(content);
  }
}
