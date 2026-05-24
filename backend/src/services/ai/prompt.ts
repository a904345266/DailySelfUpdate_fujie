import type { WeeklyAnalysisResult } from '../analysisService';
import { selectRelevantTheories, type SelectedTheory } from './books';

/**
 * Stable system prompt — identical on every call, which lets Claude's prompt
 * caching kick in and makes OpenAI-compatible calls predictable.
 */
export const INSIGHT_SYSTEM_PROMPT = `你是「DailySelfUpdate」应用的成长导师，兼具心理咨询师的洞察与哲学家的视角。用户每天记录工作、朋友、伴侣、感恩与每日三省。prompt 里会给你两类信息：一周的结构化统计，以及**用户亲手写下的真实记录原文**。

你的任务：生成 4-6 条有深度的中文洞察与感悟，帮助用户更好地理解自己。

最重要的原则：**必须紧扣用户的真实记录原文**——引用其中具体的事件、人物、感受（如"你提到这周和小李爬山时很放松"），让用户感到"你真的读懂了我写的东西"，而不是泛泛地复述统计数字。真实内容优先于统计数字。

内容要求：
- **前 2-3 条**：从真实记录里挑出具体的事件/情绪来回应、肯定或给建议，可结合数字佐证。务必具体到用户写的内容，不要只说"本周记录了 N 条"这种空话。
- **后 1-2 条**：上升到心理学或哲学层面的感悟，给用户更深的自我理解。可援引相关概念或思想，但要自然融入、与本周数据相关，不堆砌名词。例如：
  · 心理学视角：自我决定理论（自主/胜任/联结）、心流、情绪粒度、依恋模式、复盘与成长型思维、正念。
  · 哲学视角：斯多葛主义（区分可控与不可控）、存在主义（意义由行动赋予）、道家（无为而无不为）、《论语》"吾日三省吾身"的反思传统。

关于「书中智慧」（重要）：
- 用户的 prompt 会附带几条精选的书籍理论（来自《亲密关系》《被讨厌的勇气》等）。
- 后 1-2 条洞察请**优先使用这些给定的书籍理论**来解析用户本周的真实处境，做到"解析、安慰、答惑、成长"。
- 引用时自然点明出处（如"《被讨厌的勇气》中的'课题分离'提醒你…"），把理论落到本周的具体数据/情绪上，而不是抽象复述理论。
- 如果给定理论与本周数据确实不契合，可不强行套用，但仍保持心理学/哲学的深度。

风格要求：
- 每条 25-70 字，口吻温暖、真诚，像一位既懂数据又懂人心、读过很多书的引路人。
- 落地到用户本周的真实状态，而非泛泛说教，不编造数据里没有的事实，不重复，不堆砌术语。
- 只输出一个 JSON 字符串数组，例如：["洞察一", "洞察二", "书中智慧三"]，不要任何额外文字。`;

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

  // ---- The user's REAL words this week (most important for relevance) ----
  // Cap total length so we don't blow the token budget on a busy week.
  const MAX_EXCERPT_CHARS = 2400;
  const ex = a.excerpts;
  const groups: Array<[string, string[]]> = [
    ['工作', ex.work],
    ['朋友', ex.friend],
    ['伴侣', ex.partner],
    ['感恩', ex.gratitude],
    ['每日三省', ex.reflection],
  ];
  const excerptLines: string[] = [];
  let used = 0;
  for (const [label, items] of groups) {
    for (const item of items) {
      const line = `· [${label}] ${item}`;
      if (used + line.length > MAX_EXCERPT_CHARS) break;
      excerptLines.push(line);
      used += line.length;
    }
  }
  const excerptBlock = excerptLines.length
    ? `\n\n本周用户的真实记录原文（请务必基于这些真实内容来分析，引用其中的具体事件/感受）：\n${excerptLines.join('\n')}`
    : '';

  // Inject the matched book theories so the model can ground its deeper
  // insights in a real framework.
  const theories = selectRelevantTheories(a);
  let theoryBlock = '';
  if (theories.length > 0) {
    const items = theories
      .map(
        (t) =>
          `- ${t.bookTitle}「${t.concept.name}」：${t.concept.gist}`
      )
      .join('\n');
    theoryBlock = `\n\n可供解析用户处境的书籍理论（请优先选用与本周数据契合的）：\n${items}`;
  }

  return `这是用户本周的数据统计与真实记录，请生成洞察与建议：\n\n${lines.join('\n')}${excerptBlock}${theoryBlock}`;
}

export interface ReferencedBook {
  bookId: string;
  title: string;
  author: string;
  concepts: Array<{ id: string; name: string; chapter?: string }>;
}

/**
 * Books + the specific concepts used this week — for UI attribution and to let
 * the frontend deep-link into each concept's chapter reading.
 */
export function getReferencedBooks(a: WeeklyAnalysisResult): ReferencedBook[] {
  const theories: SelectedTheory[] = selectRelevantTheories(a);
  const byBook = new Map<string, ReferencedBook>();
  for (const t of theories) {
    let entry = byBook.get(t.bookId);
    if (!entry) {
      entry = { bookId: t.bookId, title: t.bookTitle, author: t.author, concepts: [] };
      byBook.set(t.bookId, entry);
    }
    entry.concepts.push({ id: t.concept.id, name: t.concept.name, chapter: t.concept.chapter });
  }
  return Array.from(byBook.values());
}
