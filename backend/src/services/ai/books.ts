import type { WeeklyAnalysisResult } from '../analysisService';

/**
 * A hand-curated knowledge base of psychology/philosophy books. Each book holds
 * a few core concepts (name + gist + when it applies). The weekly-insight
 * prompt injects the most relevant concepts so the AI explains the user's week
 * through a real theoretical lens — rather than vague platitudes.
 *
 * Extensible: add a new book = append a BookTheory entry. A future "live book
 * lookup / RAG" source can implement the same `selectRelevantTheories` shape.
 */

export interface Concept {
  name: string; // 概念名
  gist: string; // 一句话精髓
  appliesTo: string; // 适用场景（指导选书匹配）
}

export interface BookTheory {
  id: string;
  title: string;
  author: string;
  /** Themes this book is strong on, used for matching against weekly data. */
  themes: Array<'work' | 'friend' | 'partner' | 'gratitude' | 'self' | 'emotion'>;
  concepts: Concept[];
}

export const BOOKS: BookTheory[] = [
  {
    id: 'intimacy',
    title: '《亲密关系》',
    author: '克里斯多福·孟',
    themes: ['partner', 'friend', 'emotion', 'self'],
    concepts: [
      {
        name: '关系的四个阶段',
        gist: '亲密关系依次经历"月晕（绚丽）→幻灭→内省→启示"：先被对方光环吸引，再因期待落空而失望，进而向内看见自己的伤，最终在关系中照见并疗愈自己。冲突与失望不是关系破裂的信号，而是它要带你进入下一阶段的邀请。',
        appliesTo: '伴侣间有争论、失望、疏离，关系进入平淡期或倦怠期',
      },
      {
        name: '需求、期待与要求',
        gist: '我们带着童年未被满足的需求进入关系，把它们变成对伴侣的"期待"，期待落空就化为"要求"与指责。痛苦的根源不是对方做错了什么，而是我们要对方来填补本应自己面对的匮乏。',
        appliesTo: '对伴侣/朋友感到失望、被忽视、想改变对方、反复因小事争执',
      },
      {
        name: '伴侣是一面镜子（投射与触发）',
        gist: '最能激起你强烈情绪的人，往往照见你内心尚未疗愈的部分。你在对方身上看到的"缺点"，常是你不愿面对的自己。情绪被触发的瞬间，正是认识自己的入口。',
        appliesTo: '强烈的负面情绪、反复的关系冲突、对某类人特别反感',
      },
      {
        name: '受害者监牢（受害者-迫害者-拯救者）',
        gist: '在冲突中我们常在三种角色间打转：觉得"都是你害的"（受害者）、指责攻击对方（迫害者）、或委屈地讨好（拯救者）。看清自己正在扮演哪个角色，是跳出剧本的第一步。',
        appliesTo: '争论中觉得委屈、归咎对方、或习惯性退让讨好',
      },
      {
        name: '从"寻找爱"到"成为爱"',
        gist: '真正的亲密不是找到对的人来填补自己的空缺，而是先让自己完整，再与对方分享这份完整。爱不是索取与交换，而是一种存在状态。',
        appliesTo: '孤独感、过度依赖关系、关系留白、害怕独处',
      },
      {
        name: '亲密是一种选择（穿越而非逃避）',
        gist: '当关系出现裂痕，逃避或更换对象只会把同样的功课带到下一段关系。愿意停留、穿越不适，才能抵达更深的连接——亲密不是感觉，是反复的选择。',
        appliesTo: '想逃离关系、重复同类关系问题、对关系失去耐心',
      },
    ],
  },
  {
    id: 'courage',
    title: '《被讨厌的勇气》',
    author: '岸见一郎（阿德勒心理学）',
    themes: ['self', 'work', 'friend', 'emotion'],
    concepts: [
      {
        name: '目的论（而非原因论）',
        gist: '决定我们的不是过去的经历，而是我们当下赋予经历的"目的"。情绪与症状不是被过去推着走的结果，而是为达成某个目的（如逃避、控制、求关注）而被"制造"出来的工具。改变的钥匙始终在现在。',
        appliesTo: '焦虑、愤怒、把现状归咎于过去或他人、觉得"我没办法"',
      },
      {
        name: '课题分离',
        gist: '凡事先问"这是谁的课题"——后果由谁承担，就是谁的课题。别人如何评价你、是否喜欢你，是别人的课题，你无法也不必为此负责。把手从别人的课题上拿开，是人际烦恼的解药。',
        appliesTo: '在意他人评价、人际焦虑、为别人的情绪负责、讨好',
      },
      {
        name: '一切烦恼都是人际关系的烦恼',
        gist: '阿德勒断言：人的烦恼归根结底都来自人际关系。孤独感、自卑、竞争压力，都只在"与他人比较/在意他人"的坐标里才成立。看清这一点，许多痛苦便有了着力点。',
        appliesTo: '孤独、比较带来的焦虑、竞争压力、自卑',
      },
      {
        name: '自卑情结 vs 健康的自卑',
        gist: '健康的自卑是"理想的我"与"现在的我"的差距，能推动成长；而自卑情结是把"我不行"当借口来逃避课题（"因为A，所以做不到B"）。区分两者，自卑就能从枷锁变成动力。',
        appliesTo: '自我苛责、用"我不够好"逃避、与人比较后沮丧',
      },
      {
        name: '横向关系（而非纵向关系）',
        gist: '不把人际看成上下高低的纵向关系（评价、表扬、批评都暗含高低），而是平等的横向关系。用"谢谢""你帮了我"代替表扬，建立在贡献感而非优越感之上的连接才是健康的。',
        appliesTo: '人际中的竞争心、寻求认可、亲子/同事关系紧张',
      },
      {
        name: '共同体感觉与"贡献感"',
        gist: '幸福即"贡献感"——感到"我对他人/共同体有用"。价值不来自被表扬，而来自"我能给予"。把对自己的执着（self-interest）转向对他人的关心（social interest），是通往归属与自由的路。',
        appliesTo: '孤独、价值感低、人际疏离、觉得活着没意义',
      },
      {
        name: '甘于平凡的勇气',
        gist: '不必"特别优秀"或"特别糟糕"来证明自己的存在，接纳普通的自己，正是"被讨厌的勇气"的核心。自由，意味着不再活在他人的期待里，也意味着甘愿承受可能被讨厌的代价。',
        appliesTo: '过度追求成就、害怕不够好、害怕被否定',
      },
      {
        name: '人生是连续的刹那（活在此时此刻）',
        gist: '人生不是通往某个目标的一条线，而是由无数个"当下"组成的点的连续。不必等到"达成什么"才开始活，认真跳好此刻这支舞，本身就是意义。',
        appliesTo: '焦虑未来、觉得忙碌却空虚、目标感缺失、拖延',
      },
    ],
  },
];

export interface SelectedTheory {
  bookId: string;
  bookTitle: string;
  author: string;
  concept: Concept;
}

/**
 * Pick the theories most relevant to this week's data. Heuristic for now;
 * the interface is stable so it can later be backed by RAG / live lookup.
 */
export function selectRelevantTheories(a: WeeklyAnalysisResult, max = 3): SelectedTheory[] {
  const selected: SelectedTheory[] = [];
  const push = (bookId: string, conceptName: string) => {
    const book = BOOKS.find((b) => b.id === bookId);
    const concept = book?.concepts.find((c) => c.name === conceptName);
    if (book && concept && !selected.some((s) => s.concept.name === conceptName)) {
      selected.push({ bookId: book.id, bookTitle: book.title, author: book.author, concept });
    }
  };

  const anxious = (a.work.byEmotion?.anxious ?? 0) + (a.emotional.emotionDistribution?.anxious ?? 0);
  const hasPartner = a.totals.partner > 0;
  const unresolved = a.relationship.unresolvedArguments;
  const noRelationships = a.totals.partner + a.totals.friend === 0;
  const lowRating = a.emotional.avgOverallRating !== null && a.emotional.avgOverallRating <= 2.5;
  const highWork = a.totals.work >= 5;

  // Relationship signals → 《亲密关系》
  if (unresolved > 0) {
    push('intimacy', '受害者监牢（受害者-迫害者-拯救者）');
    push('intimacy', '关系的四个阶段');
  }
  if (hasPartner || a.totals.friend > 0) push('intimacy', '需求、期待与要求');
  if (noRelationships) push('intimacy', '从"寻找爱"到"成为爱"');

  // Self / emotion signals → 《被讨厌的勇气》
  if (anxious >= 2) push('courage', '目的论（而非原因论）');
  if (highWork || lowRating) push('courage', '甘于平凡的勇气');
  if (lowRating) push('courage', '自卑情结 vs 健康的自卑');
  if (noRelationships) push('courage', '共同体感觉与"贡献感"');

  // Always have at least a couple of grounding concepts.
  if (selected.length < 2) {
    push('courage', '课题分离');
    push('intimacy', '伴侣是一面镜子（投射与触发）');
    push('courage', '人生是连续的刹那（活在此时此刻）');
  }

  return selected.slice(0, max);
}
