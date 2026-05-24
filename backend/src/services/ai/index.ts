import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { WeeklyAnalysisResult } from '../analysisService';
import { OpenAiCompatibleProvider } from './openaiProvider';
import { ClaudeProvider } from './claudeProvider';
import { AiProvider, ProviderName } from './types';
import { INSIGHT_SYSTEM_PROMPT, buildInsightUserPrompt, getReferencedBooks } from './prompt';

export type UserTier = 'free' | 'vip';
export type InsightSource = 'ai' | 'rules';

function makeProvider(name: ProviderName): AiProvider {
  if (name === 'claude') return new ClaudeProvider();
  return new OpenAiCompatibleProvider(name);
}

function providerForTier(tier: UserTier): AiProvider {
  const name = tier === 'vip' ? env.AI_VIP_PROVIDER : env.AI_FREE_PROVIDER;
  return makeProvider(name);
}

export interface InsightOutcome {
  recommendations: string[];
  source: InsightSource;
  provider?: ProviderName;
  /** Books whose theories informed the AI insights (empty for rule fallback). */
  referencedBooks: Array<{ title: string; author: string }>;
}

/**
 * Generate insights for a weekly analysis. Returns AI-generated recommendations
 * when possible, otherwise falls back to the rule-based ones already computed
 * in `analysis.recommendations`. Never throws — the summary must always render.
 */
export async function generateInsights(
  analysis: WeeklyAnalysisResult,
  tier: UserTier
): Promise<InsightOutcome> {
  const ruleFallback: InsightOutcome = {
    recommendations: analysis.recommendations,
    source: 'rules',
    referencedBooks: [],
  };

  if (!env.AI_ENABLED) return ruleFallback;

  const provider = providerForTier(tier);
  if (!provider.isConfigured()) {
    logger.warn(`AI provider "${provider.name}" not configured — using rule-based insights`);
    return ruleFallback;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);
  try {
    const recommendations = await provider.generate(
      { system: INSIGHT_SYSTEM_PROMPT, user: buildInsightUserPrompt(analysis) },
      controller.signal
    );
    if (recommendations.length === 0) return ruleFallback;
    return {
      recommendations,
      source: 'ai',
      provider: provider.name,
      referencedBooks: getReferencedBooks(analysis),
    };
  } catch (err) {
    logger.warn(
      `AI insight generation failed (provider=${provider.name}), falling back to rules: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
    return ruleFallback;
  } finally {
    clearTimeout(timer);
  }
}
