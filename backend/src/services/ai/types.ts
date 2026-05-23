export type ProviderName = 'openai' | 'deepseek' | 'claude';

export interface InsightRequest {
  /** System prompt — stable across calls, so it's cache-friendly. */
  system: string;
  /** User prompt — the week's stats serialized. */
  user: string;
}

export interface AiProvider {
  readonly name: ProviderName;
  /** Whether this provider is usable (has a key etc.). */
  isConfigured(): boolean;
  /**
   * Generate a list of short Chinese insight strings.
   * Throws on failure — the orchestrator handles fallback.
   */
  generate(req: InsightRequest, signal: AbortSignal): Promise<string[]>;
}

/** Parse the model's reply into a clean string[] of insights. */
export function parseInsights(raw: string): string[] {
  const trimmed = raw.trim();

  // Prefer a JSON array if the model returned one.
  try {
    const start = trimmed.indexOf('[');
    const end = trimmed.lastIndexOf(']');
    if (start !== -1 && end > start) {
      const arr = JSON.parse(trimmed.slice(start, end + 1));
      if (Array.isArray(arr)) {
        return arr
          .map((x) => String(x).trim())
          .filter(Boolean)
          .slice(0, 8);
      }
    }
  } catch {
    /* fall through to line parsing */
  }

  // Otherwise split by lines / bullets.
  return trimmed
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.、)])\s*/, '').trim())
    .filter((l) => l.length > 0)
    .slice(0, 8);
}
