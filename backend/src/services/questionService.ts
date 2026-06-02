import { prisma } from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';

// 预设的问题库
const QUESTION_BANK = [
  {
    id: '1',
    type: 'philosophy',
    category: '自我认知',
    question: '如果你可以选择改变过去的一个决定，你会选择改变什么？为什么？',
    answer: '这是一个关于接纳自我的哲学思考',
    explanation: '这个问题帮助我们思考：过去的每一个决定都塑造了现在的我们。改变任何决定都可能让我们失去现在的成长和经历。真正重要的是从过去的学习中获得智慧，而不是试图逃避过去。'
  },
  {
    id: '2',
    type: 'psychology',
    category: '情绪管理',
    question: '当你感到焦虑时，以下哪种方式最能帮助你平静下来？',
    options: ['深呼吸和冥想', '与朋友交谈', '进行体育运动', '专注于当下的任务'],
    answer: '深呼吸和冥想',
    explanation: '虽然所有选项都有助于缓解焦虑，但深呼吸和冥想是最直接有效的生理调节方法。它们通过激活副交感神经系统来降低心率和血压，从而快速缓解焦虑症状。'
  },
  {
    id: '3',
    type: 'story',
    category: '人际关系',
    question: '两个人一起过桥，桥很窄只能容纳一人通过。一个人停下来说："我老了，腿脚不便，请您先过。" 另一个人却说："不，还是您先过吧。" 结果两人都顺利通过了桥。这个故事说明了什么？',
    answer: '相互尊重与谦让创造双赢',
    explanation: '这个故事展示了真正的谦让不是单方面的牺牲，而是基于相互理解和尊重。当双方都愿意优先考虑对方时，往往能找到超出预期的解决方案。这种态度有助于建立更和谐的人际关系。'
  },
  {
    id: '4',
    type: 'reflection',
    category: '个人成长',
    question: '在你的人生中，哪一种品质是你最希望培养的？',
    options: ['耐心', '勇气', '同理心', '自律'],
    answer: '同理心',
    explanation: '同理心是连接人与人之间的桥梁，它不仅能帮助我们更好地理解他人，也能促进自我成长。拥有同理心的人更容易建立深厚的关系，更好地处理冲突，并在生活中找到更多的意义和满足感。'
  },
  {
    id: '5',
    type: 'philosophy',
    category: '价值观',
    question: '你认为什么是真正的快乐？',
    answer: '内在的平静与满足',
    explanation: '真正的快乐不是外在物质的累积，而是内心的平静与满足。它来自于对生活的接纳、有意义的人际关系、以及对自身价值的认同。外在的成功可能会带来短暂的愉悦，但持久的快乐源于内在的成长和心灵的富足。'
  },
  {
    id: '6',
    type: 'psychology',
    category: '认知偏差',
    question: '以下哪种心理现象解释了为什么人们倾向于记住负面事件比正面事件更深刻？',
    options: ['乐观偏差', '负面偏向', '确认偏误', '可得性启发'],
    answer: '负面偏向',
    explanation: '负面偏向是一种进化适应机制，我们的大脑天生更关注潜在威胁以确保生存。这种倾向让我们更容易记住痛苦的经历，但也可能导致过度担忧。了解这一现象有助于我们有意识地平衡注意力，更多关注积极体验。'
  },
  {
    id: '7',
    type: 'story',
    category: '决策智慧',
    question: '一位智者问学生："如果有人送你一个珍贵的礼物，但你拒绝接受，那么这个礼物属于谁？" 学生回答："当然还属于送礼的人。" 智者微笑点头。这个故事告诉我们什么？',
    answer: '怨恨和愤怒伤害不了别人，只会伤害自己',
    explanation: '就像拒绝接受礼物一样，如果我们不接受他人的恶意、批评或负面情绪，这些负面情绪就不会影响到我们。这是一种重要的心理边界，提醒我们有权选择哪些情绪进入我们的内心世界。'
  },
  {
    id: '8',
    type: 'reflection',
    category: '时间管理',
    question: '以下哪个习惯最能提升生活质量？',
    options: ['早起', '制定计划', '定期反思', '专注当下'],
    answer: '专注当下',
    explanation: '虽然所有选项都很有价值，但专注当下是其他所有习惯的基础。当我们全身心投入当前的活动时，无论是工作、休息还是人际关系，效率和满意度都会显著提高。专注当下减少了焦虑和后悔，增强了生活的丰富感。'
  },
  {
    id: '9',
    type: 'philosophy',
    category: '生命意义',
    question: '如果你的生命只剩下最后一天，你会如何度过？',
    answer: '珍惜当下，与重要的人相伴',
    explanation: '这个问题促使我们思考生命中真正重要的东西。当时间变得有限，我们会意识到物质财富远不如人际关系和内心的平静重要。每一天都值得我们用心去珍惜和体验。'
  },
  {
    id: '10',
    type: 'psychology',
    category: '压力管理',
    question: '当工作压力过大时，以下哪种方法最有效？',
    options: ['加班完成任务', '暂时离开工作环境', '向同事抱怨', '继续埋头苦干'],
    answer: '暂时离开工作环境',
    explanation: '暂时离开工作环境可以帮助大脑从压力状态中恢复。短暂的休息、散步或深呼吸能有效降低皮质醇水平，让我们以更清晰的思维回到工作中。休息不是逃避，而是为了更高效地工作。'
  },
  {
    id: '11',
    type: 'story',
    category: '心态调整',
    question: '一位农夫丢失了一匹马，邻居们都来安慰他。农夫却说："这也许是件好事。" 几天后，丢失的马带回了一群野马。这个故事告诉我们什么道理？',
    answer: '塞翁失马，焉知非福',
    explanation: '这个故事体现了道家思想中的辩证法。生活中的得失往往是相互转化的，眼前的损失可能是未来收获的种子。保持开放的心态，不被一时的得失所困扰，才能更好地面对生活的起伏。'
  },
  {
    id: '12',
    type: 'reflection',
    category: '职业发展',
    question: '你更愿意选择一份高薪但不喜欢的工作，还是一份低薪但热爱的工作？',
    options: ['高薪不喜欢的工作', '低薪热爱的工作', '寻找两者平衡', '先赚钱再追求热爱'],
    answer: '寻找两者平衡',
    explanation: '理想的状态是找到既能发挥热情又能提供合理报酬的工作。如果必须二选一，短期可以选择高薪积累资本，但长期来看，热爱能带来持续的动力和幸福感。关键是不要让金钱成为唯一的衡量标准。'
  },
  {
    id: '13',
    type: 'philosophy',
    category: '人际关系',
    question: '你认为维持一段良好关系最重要的因素是什么？',
    options: ['共同兴趣', '相互信任', '物质支持', '频繁沟通'],
    answer: '相互信任',
    explanation: '信任是任何关系的基石。没有信任，再多的共同兴趣或频繁沟通都难以建立深厚的连接。信任建立在诚实、可靠和尊重的基础上，是维系长期关系的核心。'
  },
  {
    id: '14',
    type: 'psychology',
    category: '自我接纳',
    question: '当你发现自己犯了一个严重的错误时，你通常会怎么做？',
    options: ['自责并逃避', '分析原因并学习', '归咎于他人', '假装什么都没发生'],
    answer: '分析原因并学习',
    explanation: '错误是成长的机会而非耻辱。健康的心态是承认错误、分析原因、从中学习并向前迈进。自责只会消耗能量，而积极的反思能带来真正的进步。'
  },
  {
    id: '15',
    type: 'story',
    category: '人生智慧',
    question: '一位年轻人问智者："怎样才能快乐？" 智者回答："不要追求快乐，而是追求意义。" 这个回答说明了什么？',
    answer: '意义带来持久的满足感',
    explanation: '快乐是短暂的情绪体验，而意义是更深层次的满足来源。当我们的生活有目标、有价值、有贡献时，自然会获得持久的幸福感。追求意义让我们超越短暂的享乐，找到人生的方向。'
  },
  {
    id: '16',
    type: 'reflection',
    category: '健康生活',
    question: '以下哪种生活方式对你的身心健康影响最大？',
    options: ['规律运动', '均衡饮食', '充足睡眠', '积极心态'],
    answer: '积极心态',
    explanation: '虽然健康的生活方式都很重要，但积极心态是统领一切的基础。一个积极的心态能促使我们坚持运动、保持健康饮食、更好地应对压力。心态决定了我们如何体验和应对生活中的各种挑战。'
  },
  {
    id: '17',
    type: 'philosophy',
    category: '自由意志',
    question: '你认为我们的人生是由命运决定的，还是由自己的选择决定的？',
    answer: '两者的结合',
    explanation: '人生是命运与选择的交织。我们无法选择自己的出身和某些境遇，但可以选择如何面对它们。真正的自由不在于改变外部环境，而在于选择自己的态度和应对方式。'
  },
  {
    id: '18',
    type: 'psychology',
    category: '社交焦虑',
    question: '在社交场合感到紧张时，以下哪种方法最有效？',
    options: ['回避社交', '假装自信', '专注于他人', '过度准备'],
    answer: '专注于他人',
    explanation: '社交焦虑往往源于过度关注自己。当我们把注意力转移到他人身上，倾听并关心对方时，自我意识会自然降低。真正的连接来自真诚的互动，而非完美的表现。'
  },
  {
    id: '19',
    type: 'story',
    category: '成长思维',
    question: '一位雕刻家正在雕琢一块石头，有人问："你在做什么？" 雕刻家回答："我在把这块石头中沉睡的天使释放出来。" 这个故事说明了什么？',
    answer: '每个人都有内在的潜能',
    explanation: '这个故事象征着每个人都拥有未被发掘的潜能。成长和自我实现就是不断发现和释放内在潜能的过程。就像雕刻家相信石头中有天使一样，我们也应该相信自己的无限可能。'
  },
  {
    id: '20',
    type: 'reflection',
    category: '目标设定',
    question: '你更倾向于设定什么样的目标？',
    options: ['远大的梦想', '具体的小目标', '顺其自然', '他人期望的目标'],
    answer: '具体的小目标',
    explanation: '远大的梦想需要分解成具体可执行的小目标才能实现。SMART原则（具体、可衡量、可实现、相关、有时限）能帮助我们将梦想转化为行动计划，逐步迈向成功。'
  },
  {
    id: '21',
    type: 'philosophy',
    category: '幸福本质',
    question: '你认为幸福是一种状态还是一种能力？',
    answer: '一种能力',
    explanation: '幸福不是被动等待的状态，而是需要培养的能力。它包括情绪调节、感恩练习、正念觉察等技能。通过学习和实践，我们可以提高自己的幸福能力，在各种环境中都能找到快乐。'
  },
  {
    id: '22',
    type: 'psychology',
    category: '拖延症',
    question: '当你拖延重要任务时，最有效的解决方法是什么？',
    options: ['设置严格的截止日期', '将任务分解', '惩罚自己', '等待灵感'],
    answer: '将任务分解',
    explanation: '拖延往往源于任务看起来过于庞大而产生的压力。将任务分解成微小的、可执行的步骤，可以降低启动门槛。完成一个小步骤后获得的成就感会激励我们继续前进。'
  },
  {
    id: '23',
    type: 'story',
    category: '耐心与坚持',
    question: '竹子在前四年只长了3厘米，但第五年却能以每天30厘米的速度生长。这个现象说明了什么？',
    answer: '厚积薄发，耐心等待',
    explanation: '竹子在前四年都在地下发展根系，为后来的快速生长打下基础。人生也是如此，很多时候我们的努力看似没有成果，但其实是在积累能量。保持耐心，相信时间的力量。'
  },
  {
    id: '24',
    type: 'reflection',
    category: '数字 detox',
    question: '你觉得每天应该花多少时间在社交媒体上？',
    options: ['尽可能多', '1-2小时', '30分钟以内', '完全不用'],
    answer: '30分钟以内',
    explanation: '适度使用社交媒体可以保持社交连接，但过度使用会影响注意力、情绪和人际关系。将时间控制在30分钟以内，专注于高质量的互动而非被动浏览，能更好地平衡线上与线下生活。'
  }
];

export async function getDailyQuestion(userId: string) {
  try {
    // 获取今天的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 获取用户今天的答题记录
    const userQuestionRecord = await prisma.dailyQuestionAttempt.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    // 使用用户ID和日期的组合来确定今天的问题（确保同一用户同一天看到相同问题）
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

  // 检查是否已经回答过今天的问题
  const existingRecord = await prisma.dailyQuestionAttempt.findFirst({
    where: {
      userId,
      date: today,
    },
  });

  if (existingRecord) {
    throw new BadRequestError('今天已经回答过问题了');
  }

  // 创建答题记录
  await prisma.dailyQuestionAttempt.create({
    data: {
      userId,
      questionId,
      userAnswer: answer,
      date: today,
    },
  });
}

// 简单的哈希函数，用于确定每天的问题
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}