/**
 * Prompt for the dashboard "daily book quote": given the user's mood/themes
 * from yesterday and the books their recent weekly summaries referenced, return
 * ONE real, uplifting quote from a classic book — encouraging / nudging /
 * positive, tailored to where the user is right now.
 */

export const QUOTE_SYSTEM_PROMPT = `你是一位温暖、博学的成长伙伴。每天为用户挑选一句来自经典书籍的话，给他带来积极向上的力量。

要求：
- 结合用户"昨天的状态"（情绪、主题、遇到的事），选一句真正契合、能起到鼓励/建议/督促作用的话。
- **强烈优先**从用户 prompt 里给定的"候选书籍"中选句——这些是已核实的真实书籍。
- 真实性是第一要求：只能引用你**确信真实存在**的书、作者和原句，书名/作者/句子三者必须真实匹配。宁可选一句你非常确定的常见名句，也**绝不要杜撰**书名、作者或拼凑不存在的引文；没有十足把握时，就从候选书籍里选。
- 语气温暖、不说教，让人读完心里一暖、获得一点力量或方向。
- 只输出一个 JSON 对象：{"quote":"那句话","book":"《书名》","author":"作者"}，不要任何额外文字、不要 markdown。`;

export interface QuoteContext {
  /** 昨日状态摘要（情绪/主题/事件），无数据时为空串 */
  yesterdaySummary: string;
  /** 候选书名列表（来自近期周总结引用 / 默认书库） */
  candidateBooks: string[];
}

export function buildQuoteUserPrompt(ctx: QuoteContext): string {
  const lines: string[] = [];
  if (ctx.yesterdaySummary.trim()) {
    lines.push(`用户昨天的状态：${ctx.yesterdaySummary}`);
  } else {
    lines.push('用户昨天没有记录（可能是新用户或空白的一天）。请给一句普适的、积极向上的经典书籍金句。');
  }
  if (ctx.candidateBooks.length > 0) {
    lines.push(`可优先选用的候选书籍：${ctx.candidateBooks.join('、')}`);
  }
  lines.push('请据此挑选一句最契合、最能给他力量的话。');
  return lines.join('\n');
}

/** Parse the model's reply into a quote payload. Tolerant of wrapping/markdown. */
export function parseQuote(
  raw: string
): { quote: string; book: string; author: string } | null {
  const text = raw.trim();
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      const obj = JSON.parse(text.slice(start, end + 1));
      const quote = String(obj.quote ?? '').trim();
      const book = String(obj.book ?? '').trim();
      const author = String(obj.author ?? '').trim();
      if (quote) return { quote, book, author };
    }
  } catch {
    /* fall through */
  }
  return null;
}
