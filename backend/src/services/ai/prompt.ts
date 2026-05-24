import type { WeeklyAnalysisResult } from '../analysisService';

/**
 * Stable system prompt — identical on every call, which lets Claude's prompt
 * caching kick in and makes OpenAI-compatible calls predictable.
 */
export const INSIGHT_SYSTEM_PROMPT = `你是「DailySelfUpdate」应用的成长导师，兼具心理咨询师的洞察与哲学家的视角。用户每天记录工作、朋友、伴侣、感恩与每日三省，应用已把一周的数据聚合成结构化统计。

你的任务：基于这些统计，生成 4-6 条有深度的中文洞察与感悟，帮助用户更好地理解自己。

内容要求：
- **前 2-3 条**：结合本周具体数字的观察与可执行建议（如"本周记录了 5 件感恩，说明你正在练习注意力的转向"）。温暖、具体、不空泛。
- **后 1-2 条**：上升到心理学或哲学层面的感悟，给用户更深的自我理解。可援引相关概念或思想，但要自然融入、与本周数据相关，不堆砌名词。例如：
  · 心理学视角：自我决定理论（自主/胜任/联结）、心流、情绪粒度、依恋模式、复盘与成长型思维、正念。
  · 哲学视角：斯多葛主义（区分可控与不可控）、存在主义（意义由行动赋予）、道家（无为而无不为）、《论语》"吾日三省吾身"的反思传统。

风格要求：
- 每条 25-60 字，口吻温暖、真诚，像一位既懂数据又懂人心的引路人。
- 哲学/心理学感悟要落地到用户本周的真实状态，而非泛泛说教。
- 不编造数据里没有的事实，不重复，不堆砌术语。
- 只输出一个 JSON 字符串数组，例如：["洞察一", "洞察二", "感悟三"]，不要任何额外文字。`;

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
