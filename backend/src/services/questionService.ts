import { prisma } from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';

export interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
}

// 预设的问题库（全部为选择题）
const QUESTION_BANK = [
  {
    id: '1',
    type: 'philosophy',
    category: '自我认知',
    question: '如果你可以选择改变过去的一个决定，以下哪种态度最为智慧？',
    options: ['后悔过去的选择并反复纠结', '接纳过去，从中学习智慧', '完全忘记过去不做回顾', '把一切归咎于运气'],
    answer: '接纳过去，从中学习智慧',
    explanation: '过去的每一个决定都塑造了现在的我们。改变任何决定都可能让我们失去现在的成长和经历。真正重要的是从过去的学习中获得智慧，而不是试图逃避过去。接纳与学习是面对过去最健康的方式。',
    books: [
      { title: '《被讨厌的勇气》', author: '岸见一郎 / 古贺史健', reason: '阿德勒心理学强调目的论——决定我们的不是过去，而是当下赋予经历的意义' },
      { title: '《活出生命的意义》', author: '维克多·弗兰克尔', reason: '即便身处最极端的境遇，人仍有选择态度的自由，意义在于如何回应' }
    ]
  },
  {
    id: '2',
    type: 'psychology',
    category: '情绪管理',
    question: '当你感到焦虑时，以下哪种方式最能帮助你平静下来？',
    options: ['深呼吸和冥想', '与朋友交谈', '进行体育运动', '专注于当下的任务'],
    answer: '深呼吸和冥想',
    explanation: '虽然所有选项都有助于缓解焦虑，但深呼吸和冥想是最直接有效的生理调节方法。它们通过激活副交感神经系统来降低心率和血压，从而快速缓解焦虑症状。',
    books: [
      { title: '《正念的奇迹》', author: '一行禅师', reason: '深入浅出地教导正念呼吸与冥想，帮助在日常中安住当下' },
      { title: '《身体从未忘记》', author: '贝塞尔·范德科尔克', reason: '从神经科学角度解释身体与情绪的关系，以及呼吸如何调节自主神经系统' }
    ]
  },
  {
    id: '3',
    type: 'story',
    category: '人际关系',
    question: '两人过窄桥时互相谦让，最终都顺利通过。这个故事最核心的启示是什么？',
    options: ['效率优先才是正确的', '相互尊重与谦让创造双赢', '社交礼仪最重要', '弱者应当被优先照顾'],
    answer: '相互尊重与谦让创造双赢',
    explanation: '真正的谦让不是单方面的牺牲，而是基于相互理解和尊重。当双方都愿意优先考虑对方时，往往能找到超出预期的解决方案。这种态度有助于建立更和谐的人际关系。',
    books: [
      { title: '《非暴力沟通》', author: '马歇尔·卢森堡', reason: '教你如何通过真诚沟通建立相互尊重的关系，化解冲突实现双赢' },
      { title: '《人性的弱点》', author: '戴尔·卡耐基', reason: '经典人际关系指南，核心理念就是通过尊重和理解赢得合作' }
    ]
  },
  {
    id: '4',
    type: 'reflection',
    category: '个人成长',
    question: '在你的人生中，哪一种品质是最值得长期培养的？',
    options: ['耐心', '勇气', '同理心', '自律'],
    answer: '同理心',
    explanation: '同理心是连接人与人之间的桥梁，它不仅能帮助我们更好地理解他人，也能促进自我成长。拥有同理心的人更容易建立深厚的关系，更好地处理冲突，并在生活中找到更多的意义和满足感。',
    books: [
      { title: '《共情的力量》', author: '亚瑟·乔拉米卡利', reason: '系统阐述同理心如何改善人际关系、提升情商，以及培养同理心的具体方法' },
      { title: '《高效能人士的七个习惯》', author: '史蒂芬·柯维', reason: '习惯五"知彼解己"深入探讨了同理心倾听的力量' }
    ]
  },
  {
    id: '5',
    type: 'philosophy',
    category: '价值观',
    question: '关于"真正的快乐"，以下哪种理解最为深刻？',
    options: ['物质富足带来的享受', '内在的平静与满足', '他人的认可与赞美', '不断追求更高的目标'],
    answer: '内在的平静与满足',
    explanation: '真正的快乐不是外在物质的累积，而是内心的平静与满足。它来自于对生活的接纳、有意义的人际关系、以及对自身价值的认同。外在的成功可能会带来短暂的愉悦，但持久的快乐源于内在的成长和心灵的富足。',
    books: [
      { title: '《幸福的方法》', author: '泰勒·本-沙哈尔', reason: '哈佛幸福课教授揭示：幸福是快乐与意义的结合，而非外在成就的堆积' },
      { title: '《心流》', author: '米哈里·契克森米哈赖', reason: '当我们全身心投入当下活动时产生的"心流"状态，是深层满足感的来源' }
    ]
  },
  {
    id: '6',
    type: 'psychology',
    category: '认知偏差',
    question: '以下哪种心理现象解释了为什么人们倾向于记住负面事件比正面事件更深刻？',
    options: ['乐观偏差', '负面偏向', '确认偏误', '可得性启发'],
    answer: '负面偏向',
    explanation: '负面偏向是一种进化适应机制，我们的大脑天生更关注潜在威胁以确保生存。这种倾向让我们更容易记住痛苦的经历，但也可能导致过度担忧。了解这一现象有助于我们有意识地平衡注意力，更多关注积极体验。',
    books: [
      { title: '《思考，快与慢》', author: '丹尼尔·卡尼曼', reason: '诺贝尔奖得主系统解析人类认知偏差，包括损失厌恶和负面偏向的心理机制' },
      { title: '《象与骑象人》', author: '乔纳森·海特', reason: '用生动比喻解释大脑的情绪系统如何影响理性判断' }
    ]
  },
  {
    id: '7',
    type: 'story',
    category: '决策智慧',
    question: '智者说"拒绝接受的礼物仍属于送礼人"，这个故事最核心的教训是什么？',
    options: ['不要轻易送礼', '怨恨和愤怒伤害不了别人，只会伤害自己', '要学会接受他人的好意', '送礼要考虑对方需求'],
    answer: '怨恨和愤怒伤害不了别人，只会伤害自己',
    explanation: '就像拒绝接受礼物一样，如果我们不接受他人的恶意、批评或负面情绪，这些负面情绪就不会影响到我们。这是一种重要的心理边界，提醒我们有权选择哪些情绪进入我们的内心世界。',
    books: [
      { title: '《被讨厌的勇气》', author: '岸见一郎 / 古贺史健', reason: '"课题分离"——别人的评价是别人的课题，你无需为此负责' },
      { title: '《当下的力量》', author: '埃克哈特·托利', reason: '学会不与负面念头认同，保持内在的觉察与平静' }
    ]
  },
  {
    id: '8',
    type: 'reflection',
    category: '时间管理',
    question: '以下哪个习惯最能提升生活质量？',
    options: ['早起', '制定计划', '定期反思', '专注当下'],
    answer: '专注当下',
    explanation: '虽然所有选项都很有价值，但专注当下是其他所有习惯的基础。当我们全身心投入当前的活动时，无论是工作、休息还是人际关系，效率和满意度都会显著提高。专注当下减少了焦虑和后悔，增强了生活的丰富感。',
    books: [
      { title: '《深度工作》', author: '卡尔·纽波特', reason: '论证专注力是当今最稀缺也最有价值的能力，并提供培养深度专注的方法' },
      { title: '《正念的奇迹》', author: '一行禅师', reason: '简洁实用地教你如何在日常生活中保持觉知和专注' }
    ]
  },
  {
    id: '9',
    type: 'philosophy',
    category: '生命意义',
    question: '如果生命只剩最后一天，以下哪种选择最能体现生命的本质？',
    options: ['完成未竟的事业', '珍惜当下，与重要的人相伴', '独自冥想回顾一生', '体验从未做过的事'],
    answer: '珍惜当下，与重要的人相伴',
    explanation: '这个问题促使我们思考生命中真正重要的东西。当时间变得有限，我们会意识到物质财富远不如人际关系和内心的平静重要。每一天都值得我们用心去珍惜和体验。',
    books: [
      { title: '《最后的演讲》', author: '兰迪·波许', reason: '一位绝症教授的人生总结——真正重要的是童年梦想、爱与感恩' },
      { title: '《活出生命的意义》', author: '维克多·弗兰克尔', reason: '在极端苦难中发现：爱与联结是生命意义的终极答案' }
    ]
  },
  {
    id: '10',
    type: 'psychology',
    category: '压力管理',
    question: '当工作压力过大时，以下哪种方法最有效？',
    options: ['加班完成任务', '暂时离开工作环境', '向同事抱怨', '继续埋头苦干'],
    answer: '暂时离开工作环境',
    explanation: '暂时离开工作环境可以帮助大脑从压力状态中恢复。短暂的休息、散步或深呼吸能有效降低皮质醇水平，让我们以更清晰的思维回到工作中。休息不是逃避，而是为了更高效地工作。',
    books: [
      { title: '《精力管理》', author: '吉姆·洛尔 / 托尼·施瓦茨', reason: '管理精力而非时间——高绩效来自于"全力投入"与"完全恢复"的交替节奏' },
      { title: '《为什么我们总是在逃避》', author: '约瑟夫·布尔戈', reason: '帮助理解压力下的防御机制，学会健康应对而非逃避' }
    ]
  },
  {
    id: '11',
    type: 'story',
    category: '心态调整',
    question: '农夫丢马后说"也许是好事"，果然马带回一群野马。这个故事的核心智慧是什么？',
    options: ['要保持乐观盲目自信', '塞翁失马焉知非福，得失会相互转化', '不要养马', '要未雨绸缪防止损失'],
    answer: '塞翁失马焉知非福，得失会相互转化',
    explanation: '这个故事体现了道家思想中的辩证法。生活中的得失往往是相互转化的，眼前的损失可能是未来收获的种子。保持开放的心态，不被一时的得失所困扰，才能更好地面对生活的起伏。',
    books: [
      { title: '《道德经》', author: '老子', reason: '"祸兮福之所倚，福兮祸之所伏"——道家核心哲学就是万事相互转化' },
      { title: '《反脆弱》', author: '纳西姆·塔勒布', reason: '有些事物反而从冲击和波动中获益，困难是变强的契机' }
    ]
  },
  {
    id: '12',
    type: 'reflection',
    category: '职业发展',
    question: '面对高薪但不喜欢 vs 低薪但热爱的工作困境，最智慧的选择是？',
    options: ['高薪不喜欢的工作', '低薪热爱的工作', '寻找两者平衡', '先赚钱再追求热爱'],
    answer: '寻找两者平衡',
    explanation: '理想的状态是找到既能发挥热情又能提供合理报酬的工作。如果必须二选一，短期可以选择高薪积累资本，但长期来看，热爱能带来持续的动力和幸福感。关键是不要让金钱成为唯一的衡量标准。',
    books: [
      { title: '《优秀到不能被忽视》', author: '卡尔·纽波特', reason: '先培养稀缺能力，再用能力换取自主权——热爱是精通的副产品' },
      { title: '《人生的智慧》', author: '叔本华', reason: '哲学家论述人生幸福的根本：内在丰富远比外在财富重要' }
    ]
  },
  {
    id: '13',
    type: 'philosophy',
    category: '人际关系',
    question: '你认为维持一段良好关系最重要的因素是什么？',
    options: ['共同兴趣', '相互信任', '物质支持', '频繁沟通'],
    answer: '相互信任',
    explanation: '信任是任何关系的基石。没有信任，再多的共同兴趣或频繁沟通都难以建立深厚的连接。信任建立在诚实、可靠和尊重的基础上，是维系长期关系的核心。',
    books: [
      { title: '《亲密关系》', author: '克里斯多福·孟', reason: '深入剖析关系的四个阶段，信任与脆弱是通往深度连接的必经之路' },
      { title: '《信任的速度》', author: '史蒂芬·M·R·柯维', reason: '信任不仅是品格问题，更是一种可学习、可量化的能力' }
    ]
  },
  {
    id: '14',
    type: 'psychology',
    category: '自我接纳',
    question: '当你发现自己犯了一个严重的错误时，最健康的应对方式是？',
    options: ['自责并逃避', '分析原因并学习', '归咎于他人', '假装什么都没发生'],
    answer: '分析原因并学习',
    explanation: '错误是成长的机会而非耻辱。健康的心态是承认错误、分析原因、从中学习并向前迈进。自责只会消耗能量，而积极的反思能带来真正的进步。',
    books: [
      { title: '《终身成长》', author: '卡罗尔·德韦克', reason: '成长型思维将错误视为学习机会而非对自身价值的否定' },
      { title: '《自我关怀的力量》', author: '克里斯汀·内夫', reason: '用善意对待自己的不完美，自我关怀比自我批评更能促进成长' }
    ]
  },
  {
    id: '15',
    type: 'story',
    category: '人生智慧',
    question: '智者说"不要追求快乐，而是追求意义"，最核心的启示是什么？',
    options: ['快乐是不好的', '意义带来持久的满足感', '人不应该享受生活', '痛苦才是人生的真相'],
    answer: '意义带来持久的满足感',
    explanation: '快乐是短暂的情绪体验，而意义是更深层次的满足来源。当我们的生活有目标、有价值、有贡献时，自然会获得持久的幸福感。追求意义让我们超越短暂的享乐，找到人生的方向。',
    books: [
      { title: '《活出生命的意义》', author: '维克多·弗兰克尔', reason: '集中营幸存者证明：即使一切被剥夺，人仍能通过寻找意义获得内在自由' },
      { title: '《心流》', author: '米哈里·契克森米哈赖', reason: '在有意义的挑战中全情投入产生的深层满足，远超感官享乐' }
    ]
  },
  {
    id: '16',
    type: 'reflection',
    category: '健康生活',
    question: '以下哪种生活方式对你的身心健康影响最大？',
    options: ['规律运动', '均衡饮食', '充足睡眠', '积极心态'],
    answer: '积极心态',
    explanation: '虽然健康的生活方式都很重要，但积极心态是统领一切的基础。一个积极的心态能促使我们坚持运动、保持健康饮食、更好地应对压力。心态决定了我们如何体验和应对生活中的各种挑战。',
    books: [
      { title: '《积极心理学》', author: '马丁·塞利格曼', reason: '积极心理学之父论证：乐观是可以学习的，幸福有科学的提升路径' },
      { title: '《习惯的力量》', author: '查尔斯·杜希格', reason: '了解习惯的神经回路，用积极心态驱动健康习惯的养成' }
    ]
  },
  {
    id: '17',
    type: 'philosophy',
    category: '自由意志',
    question: '关于人生是由命运还是选择决定的，最智慧的理解是？',
    options: ['完全由命运决定', '完全由个人选择决定', '命运与选择的结合', '一切都是随机的'],
    answer: '命运与选择的结合',
    explanation: '人生是命运与选择的交织。我们无法选择自己的出身和某些境遇，但可以选择如何面对它们。真正的自由不在于改变外部环境，而在于选择自己的态度和应对方式。',
    books: [
      { title: '《活出生命的意义》', author: '维克多·弗兰克尔', reason: '"在刺激与回应之间有一个空间，那里住着我们选择的自由和力量"' },
      { title: '《存在主义咖啡馆》', author: '莎拉·贝克韦尔', reason: '通俗讲述萨特、波伏瓦等人关于自由与选择的存在主义哲学' }
    ]
  },
  {
    id: '18',
    type: 'psychology',
    category: '社交焦虑',
    question: '在社交场合感到紧张时，以下哪种方法最有效？',
    options: ['回避社交', '假装自信', '专注于他人', '过度准备'],
    answer: '专注于他人',
    explanation: '社交焦虑往往源于过度关注自己。当我们把注意力转移到他人身上，倾听并关心对方时，自我意识会自然降低。真正的连接来自真诚的互动，而非完美的表现。',
    books: [
      { title: '《内向者优势》', author: '马蒂·兰尼', reason: '帮助理解内向特质的力量，并提供在社交中保持真实的策略' },
      { title: '《社会性动物》', author: '埃利奥特·阿伦森', reason: '从社会心理学角度理解人际互动的底层逻辑和焦虑来源' }
    ]
  },
  {
    id: '19',
    type: 'story',
    category: '成长思维',
    question: '雕刻家说"我在释放石头中沉睡的天使"，这句话的深层含义是？',
    options: ['雕刻技术很重要', '每个人都有内在的潜能等待被发掘', '石头里真的有天使', '艺术家都很浪漫'],
    answer: '每个人都有内在的潜能等待被发掘',
    explanation: '这个故事象征着每个人都拥有未被发掘的潜能。成长和自我实现就是不断发现和释放内在潜能的过程。就像雕刻家相信石头中有天使一样，我们也应该相信自己的无限可能。',
    books: [
      { title: '《终身成长》', author: '卡罗尔·德韦克', reason: '成长型思维相信能力可以通过努力发展——正如石头中的天使等待被释放' },
      { title: '《内在动机》', author: '爱德华·德西', reason: '自主、胜任、联结是激发内在潜能的三大心理需求' }
    ]
  },
  {
    id: '20',
    type: 'reflection',
    category: '目标设定',
    question: '你更倾向于设定什么样的目标？',
    options: ['远大的梦想', '具体的小目标', '顺其自然', '他人期望的目标'],
    answer: '具体的小目标',
    explanation: '远大的梦想需要分解成具体可执行的小目标才能实现。SMART原则（具体、可衡量、可实现、相关、有时限）能帮助我们将梦想转化为行动计划，逐步迈向成功。',
    books: [
      { title: '《原子习惯》', author: '詹姆斯·克利尔', reason: '每天进步1%——用微小习惯的复利效应达成远大目标' },
      { title: '《掌控习惯》', author: '詹姆斯·克利尔', reason: '系统比目标更重要，建立正确的系统让进步自动发生' }
    ]
  },
  {
    id: '21',
    type: 'philosophy',
    category: '幸福本质',
    question: '关于幸福的本质，以下哪种理解最为深刻？',
    options: ['幸福是一种运气', '幸福是一种可培养的能力', '幸福是达成目标后的奖赏', '幸福取决于外部环境'],
    answer: '幸福是一种可培养的能力',
    explanation: '幸福不是被动等待的状态，而是需要培养的能力。它包括情绪调节、感恩练习、正念觉察等技能。通过学习和实践，我们可以提高自己的幸福能力，在各种环境中都能找到快乐。',
    books: [
      { title: '《幸福的方法》', author: '泰勒·本-沙哈尔', reason: '哈佛最受欢迎的幸福课——幸福不是终点，而是可以学习和练习的能力' },
      { title: '《真实的幸福》', author: '马丁·塞利格曼', reason: '积极心理学研究表明，幸福的50%取决于可改变的思维与行为模式' }
    ]
  },
  {
    id: '22',
    type: 'psychology',
    category: '拖延症',
    question: '当你拖延重要任务时，最有效的解决方法是什么？',
    options: ['设置严格的截止日期', '将任务分解为小步骤', '惩罚自己', '等待灵感'],
    answer: '将任务分解为小步骤',
    explanation: '拖延往往源于任务看起来过于庞大而产生的压力。将任务分解成微小的、可执行的步骤，可以降低启动门槛。完成一个小步骤后获得的成就感会激励我们继续前进。',
    books: [
      { title: '《拖延心理学》', author: '简·博克 / 莱诺拉·袁', reason: '深入分析拖延的心理根源——完美主义、恐惧失败，并提供科学对策' },
      { title: '《原子习惯》', author: '詹姆斯·克利尔', reason: '"两分钟法则"——让任何行为的启动成本降到最低，战胜启动阻力' }
    ]
  },
  {
    id: '23',
    type: 'story',
    category: '耐心与坚持',
    question: '竹子前四年只长3厘米，第五年每天长30厘米。这个现象最核心的启示是？',
    options: ['竹子是一种神奇的植物', '厚积薄发，看不见的积累终会爆发', '种竹子不划算', '成功只需要等待'],
    answer: '厚积薄发，看不见的积累终会爆发',
    explanation: '竹子在前四年都在地下发展根系，为后来的快速生长打下基础。人生也是如此，很多时候我们的努力看似没有成果，但其实是在积累能量。保持耐心，相信时间的力量。',
    books: [
      { title: '《异类》', author: '马尔科姆·格拉德威尔', reason: '"一万小时定律"——看不见的持续练习是所有卓越表现的根基' },
      { title: '《刻意练习》', author: '安德斯·艾利克森', reason: '科学证明天才不是天生的，系统的刻意练习才是精通的关键' }
    ]
  },
  {
    id: '24',
    type: 'reflection',
    category: '数字 detox',
    question: '你觉得每天应该花多少时间在社交媒体上？',
    options: ['尽可能多', '1-2小时', '30分钟以内', '完全不用'],
    answer: '30分钟以内',
    explanation: '适度使用社交媒体可以保持社交连接，但过度使用会影响注意力、情绪和人际关系。将时间控制在30分钟以内，专注于高质量的互动而非被动浏览，能更好地平衡线上与线下生活。',
    books: [
      { title: '《数字极简主义》', author: '卡尔·纽波特', reason: '在噪音时代夺回注意力——精选少量数字工具，深度生活' },
      { title: '《娱乐至死》', author: '尼尔·波兹曼', reason: '媒介如何塑造思维——理解为什么被动消费内容会侵蚀深度思考能力' }
    ]
  }
];

export function getQuestionById(id: string) {
  return QUESTION_BANK.find((q) => q.id === id) ?? null;
}

export async function getDailyQuestion(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userQuestionRecord = await prisma.dailyQuestionAttempt.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    const seed = userId + today.toISOString().split('T')[0];
    const questionIndex = Math.abs(hashCode(seed)) % QUESTION_BANK.length;
    const questionTemplate = QUESTION_BANK[questionIndex];

    return {
      id: questionTemplate.id,
      type: questionTemplate.type,
      category: questionTemplate.category,
      question: questionTemplate.question,
      options: questionTemplate.options,
      answer: questionTemplate.answer,
      explanation: questionTemplate.explanation,
      books: questionTemplate.books,
      alreadyAnswered: !!userQuestionRecord,
      userAnswer: userQuestionRecord?.userAnswer || undefined,
    };
  } catch (error) {
    console.error('Error in getDailyQuestion:', error);
    throw error;
  }
}

export async function submitAnswer(userId: string, questionId: string, answer: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingRecord = await prisma.dailyQuestionAttempt.findFirst({
    where: {
      userId,
      date: today,
    },
  });

  if (existingRecord) {
    throw new BadRequestError('今天已经回答过问题了');
  }

  await prisma.dailyQuestionAttempt.create({
    data: {
      userId,
      questionId,
      userAnswer: answer,
      date: today,
    },
  });
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
