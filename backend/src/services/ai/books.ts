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
  id: string; // 稳定标识，供前端定位深读内容
  name: string; // 概念名
  gist: string; // 一句话精髓（注入 prompt / 卡片摘要）
  appliesTo: string; // 适用场景（指导选书匹配）
  chapter?: string; // 对应原书章节（索引，非原文）
  deepDive?: string; // 深度导读：我们组织的理论解读，供用户深读思考（非原文转载）
  quotes?: string[]; // 代表性引语（合理引用范围，标注出处）
  reflectQuestions?: string[]; // 引导用户结合自身反思的问题
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
        id: 'four-stages',
        name: '关系的四个阶段',
        gist: '亲密关系依次经历"月晕（绚丽）→幻灭→内省→启示"：先被对方光环吸引，再因期待落空而失望，进而向内看见自己的伤，最终在关系中照见并疗愈自己。冲突与失望不是关系破裂的信号，而是它要带你进入下一阶段的邀请。',
        appliesTo: '伴侣间有争论、失望、疏离，关系进入平淡期或倦怠期',
        chapter: '第一章「月晕现象」· 第二章「幻灭」',
        deepDive:
          '克里斯多福·孟把亲密关系比作一段有方向的旅程。「月晕」期，我们被对方身上闪耀的特质吸引，那其实是我们把自己的渴望投射上去形成的光环。蜜月褪去后进入「幻灭」——对方不再完美，我们感到被欺骗、失望、想改变对方。书中关键的洞见是：幻灭不是爱的终结，恰恰是爱要变得真实的开始。再往下是「内省」，我们开始追问自己为何如此反应，看见情绪背后的旧伤；最终抵达「启示」，明白伴侣只是来帮我们认识自己的同伴。知道自己正处在哪个阶段，就不会在幻灭时仓促逃离。',
        quotes: [
          '“亲密关系的可贵之处，在于它能让我们看清自己。”——克里斯多福·孟《亲密关系》',
          '“你期望的没有得到满足，并不代表对方有错，只代表你的期望落空了。”',
        ],
        reflectQuestions: [
          '此刻你和对方的关系，更像哪个阶段：绚丽、幻灭、内省，还是启示？',
          '这次失望背后，你真正"期待"对方给你的是什么？这个期待是从什么时候开始的？',
        ],
      },
      {
        id: 'needs-expectations',
        name: '需求、期待与要求',
        gist: '我们带着童年未被满足的需求进入关系，把它们变成对伴侣的"期待"，期待落空就化为"要求"与指责。痛苦的根源不是对方做错了什么，而是我们要对方来填补本应自己面对的匮乏。',
        appliesTo: '对伴侣/朋友感到失望、被忽视、想改变对方、反复因小事争执',
        chapter: '第二章「幻灭」· 关于"需求"的论述',
        deepDive:
          '书中区分了"需求"和"期待"：很多对伴侣的期待，其实是小时候未从父母那里得到的爱与归属，被我们悄悄转嫁给了伴侣。当伴侣无法满足时，期待就变成"你应该……"的要求，进而是失望和指责。孟提醒我们：没有人能填补另一个人内心的洞，那个洞只能由自己面对和疗愈。当你下次因小事对伴侣发火，可以停下来问：我真正想要的是什么？这个渴望，是否其实指向更早、更深的地方？',
        quotes: [
          '“期望是通往地狱之路。”——《亲密关系》',
          '“我们寻找伴侣，是为了满足那些童年时未被满足的需求。”',
        ],
        reflectQuestions: [
          '把"你应该……"的句子写下来，背后那个没被满足的需求是什么？',
          '这个需求，有没有一部分是你可以自己给自己的？',
        ],
      },
      {
        id: 'mirror',
        name: '伴侣是一面镜子（投射与触发）',
        gist: '最能激起你强烈情绪的人，往往照见你内心尚未疗愈的部分。你在对方身上看到的"缺点"，常是你不愿面对的自己。情绪被触发的瞬间，正是认识自己的入口。',
        appliesTo: '强烈的负面情绪、反复的关系冲突、对某类人特别反感',
        chapter: '第三章「内省」· 投射与镜子',
        deepDive:
          '当伴侣的某个行为让你格外愤怒或受伤，强度往往超过事件本身——这通常是"被触发"了：对方的言行碰到了你内心一处旧伤。书中说，亲密关系是一面镜子，对方照见的不是他的问题，而是你尚未整合的部分（比如你最讨厌对方"冷漠"，可能因为你也害怕自己不被需要）。这个视角不是要你忍气吞声，而是把每次强烈情绪当作向内看的线索：与其追问"他为什么这样对我"，不如问"这件事触动了我心里的什么"。',
        quotes: [
          '“我们对伴侣的不满，往往是对自己某部分的不满。”',
          '“亲密关系是一座桥，让我们从对他人的指责，走向对自己的了解。”',
        ],
        reflectQuestions: [
          '最近一次被对方强烈触发，那股情绪让你想起了更早的什么经历？',
          '你在对方身上最受不了的那一点，自己身上是否也有一些影子？',
        ],
      },
      {
        id: 'victim-prison',
        name: '受害者监牢（受害者-迫害者-拯救者）',
        gist: '在冲突中我们常在三种角色间打转：觉得"都是你害的"（受害者）、指责攻击对方（迫害者）、或委屈地讨好（拯救者）。看清自己正在扮演哪个角色，是跳出剧本的第一步。',
        appliesTo: '争论中觉得委屈、归咎对方、或习惯性退让讨好',
        chapter: '第三章「内省」· 受害者监牢',
        deepDive:
          '孟描述了冲突中常见的"戏剧三角"：受害者（"我好可怜，都是你害的"）、迫害者（指责、攻击、翻旧账）、拯救者（牺牲自己去讨好、息事宁人）。这三个角色会互相转换，让冲突循环往复、谁也走不出去。关键不在于"谁对谁错"，而在于看见：此刻我在演哪个角色？一旦觉察，你就从剧本里"出戏"了，能选择用更真诚的方式表达——说出真实的感受和需要，而不是攻击或讨好。',
        quotes: [
          '“在受害者监牢里，我们宁愿证明自己是对的，也不愿快乐。”',
          '“真正的力量，来自停止扮演角色，开始说真话。”',
        ],
        reflectQuestions: [
          '最近一次争论里，你主要在演哪个角色：受害者、迫害者，还是拯救者？',
          '如果放下这个角色，你真正想对对方说的一句真心话是什么？',
        ],
      },
      {
        id: 'become-love',
        name: '从"寻找爱"到"成为爱"',
        gist: '真正的亲密不是找到对的人来填补自己的空缺，而是先让自己完整，再与对方分享这份完整。爱不是索取与交换，而是一种存在状态。',
        appliesTo: '孤独感、过度依赖关系、关系留白、害怕独处',
        chapter: '第四章「启示」· 爱是一种存在状态',
        deepDive:
          '在旅程的尽头，孟指出一个转向：我们一开始都在"寻找爱"——找一个能让我们感到完整、被爱的人。但只要爱是"找来的"，就总怕失去、总在计较。真正的成熟是从"寻找爱"转为"成为爱"：先与自己和解、让自己内在丰盈，再把这份丰盈分享出去。这时关系不再是相互填补的交易，而是两个完整的人彼此辉映。对正感到孤独或过度依赖的人，这是一句温柔的提醒：你要的那份爱，可以先从自己这里开始给。',
        quotes: [
          '“当你不再向外寻找爱，你就成为了爱本身。”',
          '“亲密关系最终的目的，是让我们想起自己本来就是完整的。”',
        ],
        reflectQuestions: [
          '如果不依赖任何关系，你能为自己做哪一件充满爱意的小事？',
          '"我必须有人爱才完整"——这个信念，此刻还成立吗？',
        ],
      },
      {
        id: 'choose-intimacy',
        name: '亲密是一种选择（穿越而非逃避）',
        gist: '当关系出现裂痕，逃避或更换对象只会把同样的功课带到下一段关系。愿意停留、穿越不适，才能抵达更深的连接——亲密不是感觉，是反复的选择。',
        appliesTo: '想逃离关系、重复同类关系问题、对关系失去耐心',
        chapter: '贯穿全书 · 关于"穿越"的论述',
        deepDive:
          '很多人一遇到关系的不适就想抽身——分手、冷战、或在心里筑墙。但孟观察到：没穿越的功课会反复出现，下一段关系往往撞上同样的墙。亲密的深度，恰恰来自愿意停在不舒服里、把它穿越过去。这不是要你忍受伤害，而是分清"这是需要离开的关系"还是"这是需要面对的自己"。每一次选择留下来、坦诚沟通，而不是逃避，都是在为更深的连接投票。',
        quotes: [
          '“通往地狱的路，有时正是通往天堂的必经之路。”',
          '“亲密不是一种感觉，而是一个又一个的选择。”',
        ],
        reflectQuestions: [
          '你现在想逃离的，是这段关系，还是关系照见的某个自己？',
          '如果选择"穿越"，你愿意先迈出的一小步是什么？',
        ],
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
        id: 'teleology',
        name: '目的论（而非原因论）',
        gist: '决定我们的不是过去的经历，而是我们当下赋予经历的"目的"。情绪与症状不是被过去推着走的结果，而是为达成某个目的（如逃避、控制、求关注）而被"制造"出来的工具。改变的钥匙始终在现在。',
        appliesTo: '焦虑、愤怒、把现状归咎于过去或他人、觉得"我没办法"',
        chapter: '第一夜「我们的不幸是谁的错？」',
        deepDive:
          '阿德勒与弗洛伊德最大的分歧在此。弗洛伊德的"原因论"说：因为过去发生了 A，所以现在才 B（"因为童年受伤，所以现在无法亲密"）。阿德勒的"目的论"反过来：你是为了某个当下的目的，才"需要"那段过去、才"制造"出这个情绪。比如愤怒不是被惹出来的，而是你为了"压制对方/证明自己对"而拿出来用的工具。这听起来严厉，却也是解放——既然情绪是为目的服务的，你就有选择权，不必被过去判了无期徒刑。下次焦虑时可以问：这份焦虑在帮我"避免"什么？',
        quotes: [
          '“决定我们自身的不是过去的经历，而是我们自己赋予经历的意义。”',
          '“愤怒都是捏造出来的——它只是为了达成目的而被使用的工具。”',
        ],
        reflectQuestions: [
          '这份情绪，正在帮你"避免"去做什么、去面对什么？',
          '如果这件事不能赖给过去，此刻你能做的最小一步是什么？',
        ],
      },
      {
        id: 'separation-of-tasks',
        name: '课题分离',
        gist: '凡事先问"这是谁的课题"——后果由谁承担，就是谁的课题。别人如何评价你、是否喜欢你，是别人的课题，你无法也不必为此负责。把手从别人的课题上拿开，是人际烦恼的解药。',
        appliesTo: '在意他人评价、人际焦虑、为别人的情绪负责、讨好',
        chapter: '第三夜「让干涉你生活的人见鬼去」',
        deepDive:
          '阿德勒心理学的实操核心。判断一件事是谁的课题，只需问："这个选择带来的后果，最终由谁承担？"你努力工作，是你的课题；别人怎么评价你的努力，是别人的课题。父母能做的是把书放在孩子够得到的地方，至于学不学习，是孩子的课题。课题分离不是冷漠，而是把界限划清——你不再为别人的情绪和评价负责，也不让别人来支配你的人生。一切人际烦恼，几乎都源于对他人课题的妄加干涉，或允许别人干涉自己的课题。',
        quotes: [
          '“你之所以不幸，不是因为过去或环境，更不是因为能力不足，你只是缺乏勇气。”',
          '“把自己和别人的‘人生课题’分开来。”',
        ],
        reflectQuestions: [
          '你最近在意的那件事，后果到底由谁承担？它是谁的课题？',
          '有没有一件"别人的课题"，你正背在自己肩上？能不能放下？',
        ],
      },
      {
        id: 'all-troubles-interpersonal',
        name: '一切烦恼都是人际关系的烦恼',
        gist: '阿德勒断言：人的烦恼归根结底都来自人际关系。孤独感、自卑、竞争压力，都只在"与他人比较/在意他人"的坐标里才成立。看清这一点，许多痛苦便有了着力点。',
        appliesTo: '孤独、比较带来的焦虑、竞争压力、自卑',
        chapter: '第二夜「一切烦恼都来自人际关系」',
        deepDive:
          '阿德勒说，假如宇宙中只剩你一个人，孤独、自卑、竞争这些词都会失去意义——它们只在"有他人"的坐标里才成立。这不是要你逃离人际，而是点明：烦恼的根，几乎都长在关系里。把这一点看透，痛苦就从"模糊的难受"变成"可以处理的关系议题"，你能去追问：我是在和谁比较？我在害怕谁的眼光？',
        reflectQuestions: ['你此刻的烦恼，如果剥去"他人"这个坐标，还剩下什么？'],
      },
      {
        id: 'inferiority',
        name: '自卑情结 vs 健康的自卑',
        gist: '健康的自卑是"理想的我"与"现在的我"的差距，能推动成长；而自卑情结是把"我不行"当借口来逃避课题（"因为A，所以做不到B"）。区分两者，自卑就能从枷锁变成动力。',
        appliesTo: '自我苛责、用"我不够好"逃避、与人比较后沮丧',
        chapter: '第二夜「自卑感来自主观的臆造」',
        deepDive:
          '阿德勒区分了两样常被混淆的东西。"自卑感"是健康的——它是"理想的自己"和"现在的自己"之间的落差，这种落差能成为努力和成长的燃料。但"自卑情结"是一种逃避：把自卑当作不去行动的借口（"因为我学历低，所以做不成"），用"因为 A 所以做不到 B"的句式把自己钉在原地。更隐蔽的是"优越情结"——通过贬低别人或炫耀来掩盖自卑。关键的转念是：不和别人比，只和昨天的自己比；自卑感是礼物，自卑情结才是牢笼。',
        quotes: [
          '“健全的自卑感不是来自与别人的比较，而是来自与‘理想的自己’的比较。”',
          '“无论怎样的优越性追求，都是从自卑感开始的。”',
        ],
        reflectQuestions: [
          '你最近的沮丧，是"和理想的自己比"，还是"和别人比"出来的？',
          '有没有一句"因为……所以我做不到"，其实是借口而非事实？',
        ],
      },
      {
        id: 'horizontal-relationship',
        name: '横向关系（而非纵向关系）',
        gist: '不把人际看成上下高低的纵向关系（评价、表扬、批评都暗含高低），而是平等的横向关系。用"谢谢""你帮了我"代替表扬，建立在贡献感而非优越感之上的连接才是健康的。',
        appliesTo: '人际中的竞争心、寻求认可、亲子/同事关系紧张',
        chapter: '第四夜「要有被讨厌的勇气」· 横向关系',
        deepDive:
          '阿德勒反对一切"纵向关系"——把人放在上下高低的坐标里。表扬和批评都暗含纵向：表扬是"有能力者对无能力者"的评价。他主张"横向关系"：人与人是平等而不同的伙伴。把"你真棒"换成"谢谢你""你帮了我大忙"，区别在于前者是评价、后者是感谢；感谢传递的是"你对我有贡献"，建立的是平等的连接。在这种关系里，人不必通过竞争或讨好来确认价值。',
        reflectQuestions: ['你和某个人的紧张，是不是卡在"谁高谁低"的纵向比较里？'],
      },
      {
        id: 'community-feeling',
        name: '共同体感觉与"贡献感"',
        gist: '幸福即"贡献感"——感到"我对他人/共同体有用"。价值不来自被表扬，而来自"我能给予"。把对自己的执着（self-interest）转向对他人的关心（social interest），是通往归属与自由的路。',
        appliesTo: '孤独、价值感低、人际疏离、觉得活着没意义',
        chapter: '第四夜 / 第五夜「认真的人生‘活在当下’」',
        deepDive:
          '阿德勒认为，幸福的本质是"贡献感"——感到"我对他人、对共同体是有用的"。注意：是贡献"感"，一种主观体认，而非必须被他人看见或表扬。当你把注意力从"别人怎么看我"（对自己的执着）转向"我能为别人做什么"（对他人的关心），归属感和价值感会自然生长。对感到孤独或活着没意义的人，这指出一条具体的路：不必等被爱、被认可，先去给予、去贡献，意义会在给予中浮现。',
        quotes: ['“幸福即贡献感。”', '“把对自己的执着，转换成对他人的关心。”'],
        reflectQuestions: ['本周有没有一个时刻，你感到"我对某人是有用的"？那是什么感觉？'],
      },
      {
        id: 'courage-to-be-ordinary',
        name: '甘于平凡的勇气',
        gist: '不必"特别优秀"或"特别糟糕"来证明自己的存在，接纳普通的自己，正是"被讨厌的勇气"的核心。自由，意味着不再活在他人的期待里，也意味着甘愿承受可能被讨厌的代价。',
        appliesTo: '过度追求成就、害怕不够好、害怕被否定',
        chapter: '第五夜「甘于平凡的勇气」',
        deepDive:
          '很多人害怕"平凡"，于是要么拼命追求"特别优秀"来证明自己，要么不自觉地用"特别糟糕"（叛逆、问题行为）来获得关注——两者都是同一种焦虑：怕自己"普通"就没有存在价值。阿德勒说，接受"普通的自己"需要勇气，而这正是"被讨厌的勇气"的内核：自由，就是不再为满足他人的期待而活，并甘愿承担"可能被一些人讨厌"的代价。被所有人喜欢，恰恰意味着你活在所有人的评价里、毫不自由。',
        quotes: [
          '“自由就是被别人讨厌。”',
          '“甘于平凡的勇气——‘普通’并不等于‘无能’。”',
        ],
        reflectQuestions: [
          '你近来的疲惫，有多少来自"必须证明自己不普通"？',
          '如果允许自己做个"普通但真诚"的人，会松一口气吗？',
        ],
      },
      {
        id: 'series-of-moments',
        name: '人生是连续的刹那（活在此时此刻）',
        gist: '人生不是通往某个目标的一条线，而是由无数个"当下"组成的点的连续。不必等到"达成什么"才开始活，认真跳好此刻这支舞，本身就是意义。',
        appliesTo: '焦虑未来、觉得忙碌却空虚、目标感缺失、拖延',
        chapter: '第五夜「认真地活在‘此时此刻’」',
        deepDive:
          '阿德勒把人生比作跳舞而非旅行：旅行有目的地，跳舞却是"跳"本身就是意义，每一刻都圆满。我们常把人生理解成一条通往某个目标的线——"等我升职/买房/变好了，才算真正开始活"，于是当下永远是手段、是未完成。但人生其实是无数个"此时此刻"组成的点的连续。不必等到达成什么，认真活好眼前这一刻，意义就已经在了。对焦虑未来或觉得忙碌却空虚的人，这是一句邀请：把聚光灯打在当下这一步。',
        quotes: [
          '“人生是一连串的刹那，根本不存在‘过去’和‘未来’。”',
          '“起决定作用的既不是昨天也不是明天，而是‘此时此刻’。”',
        ],
        reflectQuestions: ['你是否在"等某件事达成后才开始好好生活"？那件事是什么？'],
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

/** Look up a concept's full deep-dive content by book + concept id. */
export function findConcept(
  bookId: string,
  conceptId: string
): { book: BookTheory; concept: Concept } | null {
  const book = BOOKS.find((b) => b.id === bookId);
  const concept = book?.concepts.find((c) => c.id === conceptId);
  if (!book || !concept) return null;
  return { book, concept };
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
