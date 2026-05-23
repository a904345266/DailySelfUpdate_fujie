import type { WeeklyAnalysisResult } from '../analysisService';

/**
 * Stable system prompt — identical on every call, which lets Claude's prompt
 * caching kick in and makes OpenAI-compatible calls predictable.
 */
export const INSIGHT_SYSTEM_PROMPT = `你是「DailySelfUpdate」应用的成长教练。用户每天用语音记录工作、朋友、伴侣、感恩与每日三省，应用已经把一周的数据聚合成结构化统计。

你的任务：基于这些统计，生成 3-6 条**简短、具体、可执行**的中文洞察与建议。

要求：
- 每条不超过 40 字，口吻温暖、鼓励，像一位懂你的教练。
- 优先指出值得肯定的地方，再给改进建议。
- 结合具体数字（如"本周记录了 5 件感恩"）让建议有据可依。
- 不要空泛说教，不要重复，不要编造数据里没有的信息。
- 只输出一个 JSON 字符串数组，例如：["建议一", "建议二", "建议三"]，不要任何额外文字。`;

export function buildInsightUserPrompt(a: WeeklyAnalysisResult): string {
  // Compact, model-friendly summary of the week.
  const lines: string[] = [];
  lines.push(`周期: ${a.weekStart} 至 ${a.weekEnd}`);
  lines.push(
    `记录总量: 工作 ${a.totals.work} · 朋友 ${a.totals.friend} · 伴侣 ${a.totals.partner} · 感恩 ${a.totals.gratitude} · 三省天数 ${a.totals.reflectionDays} · 活跃天数 ${a.totals.activeDays}/7`
  );
  lines.push(
    `工作: 最多分类=${a.work.topCategory ?? '无'}, 平均重要性=${a.work.avgImportance ?? '无'}, 情绪分布=${JSON.stringify(a.work.byEmotion)}, 待跟进=${a.work.followUps}`
  );
  lines.push(
    `人际: 联系朋友=${a.relationship.friendsContacted.length}人, 伴侣互动=${JSON.stringify(a.relationship.partnerInteractions)}, 未解决争论=${a.relationship.unresolvedArguments}`
  );
  lines.push(
    `感恩: 数量=${a.gratitude.count}, 平均影响力=${a.gratitude.avgImpact ?? '无'}, 来源分布=${JSON.stringify(a.gratitude.byCategory)}`
  );
  lines.push(
    `情绪: 周平均评分=${a.emotional.avgOverallRating ?? '无'}, 情绪分布=${JSON.stringify(a.emotional.emotionDistribution)}`
  );
  if (a.growth.achievements.length) lines.push(`本周成就: ${a.growth.achievements.join('；')}`);
  if (a.growth.challenges.length) lines.push(`本周挑战: ${a.growth.challenges.join('；')}`);

  return `这是用户本周的数据统计，请生成洞察与建议：\n\n${lines.join('\n')}`;
}
