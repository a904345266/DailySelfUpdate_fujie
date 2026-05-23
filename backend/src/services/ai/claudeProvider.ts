import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { AiProvider, InsightRequest, ProviderName, parseInsights } from './types';

export class ClaudeProvider implements AiProvider {
  readonly name: ProviderName = 'claude';

  isConfigured(): boolean {
    // Usable with either a real Anthropic key or a gateway auth token.
    return !!env.ANTHROPIC_API_KEY || !!env.ANTHROPIC_AUTH_TOKEN;
  }

  async generate(req: InsightRequest, signal: AbortSignal): Promise<string[]> {
    // Prefer a gateway auth token + base URL when configured (Anthropic-compatible
    // proxy like new-api fronting GLM); otherwise use the official Anthropic key.
    const client = env.ANTHROPIC_AUTH_TOKEN
      ? new Anthropic({
          authToken: env.ANTHROPIC_AUTH_TOKEN,
          ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}),
        })
      : new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
          ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}),
        });
    const res = await client.messages.create(
      {
        model: env.CLAUDE_MODEL,
        max_tokens: 600,
        // The system prompt is stable across calls → cache it to cut cost ~10x
        // on the largest, most-repeated part of the input.
        system: [
          {
            type: 'text',
            text: req.system,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: req.user }],
      },
      { signal }
    );

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    return parseInsights(text);
  }
}
