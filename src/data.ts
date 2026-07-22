export type Feedback = '满意' | '不满意' | '未反馈';
export type SessionStatus = '已完成' | '进行中' | '手动终止';
export type TimeRange = '前一周' | '前一月' | '前三月' | '前半年';

export type RankingItem = {
  id: number;
  name: string;
  token: number;
  sessions: number;
  satisfied: number;
  dissatisfied: number;
  noFeedback: number;
  avgDuration: string;
  avgDurationSeconds: number;
};

export type Session = {
  id: number;
  query: string;
  startedAt: string;
  endedAt: string;
  duration: string;
  status: SessionStatus;
  token: string;
  feedback: Feedback;
  feedbackText: string;
  user: string;
  topic: string;
};

export type PeriodMetrics = {
  tokenTotal: string;
  sessionCount: number;
  avgDuration: string;
  avgDurationSeconds: number;
  completedSessions: number;
  inProgressSessions: number;
  terminatedSessions: number;
  completionRate: string;
  satisfied: number;
  dissatisfied: number;
  noFeedback: number;
  satisfiedRate: string;
  dissatisfiedRate: string;
  noFeedbackRate: string;
};

export type DashboardPeriod = {
  metrics: PeriodMetrics;
  userRanking: RankingItem[];
  topicRanking: RankingItem[];
  sessions: Session[];
};

type PeriodConfig = PeriodMetrics & {
  days: number;
  rankTokenFactor: number;
  rankSessionFactor: number;
};

export const timeRanges: TimeRange[] = ['前一周', '前一月', '前三月', '前半年'];

const users = ['张齐萌', '陈欣萌', '郑晓茶', '李伟', '王思雨', '刘小雨', '赵云', '孙海洋', '周婷', '杨帆', '黄健', '吴婷'];
const topics = ['KBC收款主题', '苍穹PDT经营分析', '客户收益主题', '季度销售分析', '产品健康度', '客户满意度主题', '销售排名主题', '商机转化主题', '客户增长主题', '成本核算主题'];

const queryTemplates = [
  '按分公司和产品线拆解本月订阅收款。',
  '生成苍穹 PDT 经营分析看板。',
  '分析季度销售数据与市场趋势。',
  '优化客户服务流程以提升满意度。',
  '制定新产品发布计划。',
  '进行市场调研以发现新的机会。',
  '整理团队绩效评估报告。',
  '开展品牌宣传活动以提升影响力。',
  '整理客户反馈收集与分析。',
  '梳理客户收益指标与同比变化。',
  '汇总产品健康度告警和修复建议。',
  '计算获客成本与商机转化效率。',
  '查看各区域销售目标完成情况。',
  '对比重点客户续约率和流失风险。',
  '分析各渠道线索质量与转化周期。',
  '统计产品使用活跃度和功能渗透率。',
];

const feedbackReasons = [
  '数据查询结果有误',
  '统计口径与预期不一致',
  '回答内容不够完整',
  '图表维度选择不准确',
  '查询响应时间较长',
  '未识别提问中的业务条件',
];

const baseUserRanking: RankingItem[] = users.map((name, index) => ({
  id: index + 1,
  name,
  token: [86.2, 75.4, 68.9, 92.1, 80.3, 88.5, 77.6, 90.2, 73.9, 85.0, 66.8, 64.1][index],
  sessions: [31, 26, 22, 34, 29, 33, 27, 36, 24, 30, 21, 20][index],
  satisfied: 0,
  dissatisfied: 0,
  noFeedback: 0,
  avgDuration: '',
  avgDurationSeconds: 0,
}));

const baseTopicRanking: RankingItem[] = topics.map((name, index) => ({
  id: index + 1,
  name,
  token: [88.2, 86.2, 90.3, 75.8, 92.4, 80.0, 84.7, 88.5, 91.3, 80.0][index],
  sessions: [31, 31, 45, 22, 50, 40, 35, 38, 42, 38][index],
  satisfied: 0,
  dissatisfied: 0,
  noFeedback: 0,
  avgDuration: '',
  avgDurationSeconds: 0,
}));

const periodConfigs: Record<TimeRange, PeriodConfig> = {
  前一周: {
    days: 7,
    tokenTotal: '5.9 百万',
    sessionCount: 304,
    avgDuration: '5m 37s',
    avgDurationSeconds: 337,
    completedSessions: 291,
    inProgressSessions: 8,
    terminatedSessions: 5,
    completionRate: '95.7%',
    satisfied: 184,
    dissatisfied: 28,
    noFeedback: 48,
    satisfiedRate: '70.8%',
    dissatisfiedRate: '10.8%',
    noFeedbackRate: '18.4%',
    rankTokenFactor: 1,
    rankSessionFactor: 1,
  },
  前一月: {
    days: 30,
    tokenTotal: '24.7 百万',
    sessionCount: 1276,
    avgDuration: '5m 24s',
    avgDurationSeconds: 324,
    completedSessions: 1210,
    inProgressSessions: 38,
    terminatedSessions: 28,
    completionRate: '94.8%',
    satisfied: 792,
    dissatisfied: 126,
    noFeedback: 208,
    satisfiedRate: '70.3%',
    dissatisfiedRate: '11.2%',
    noFeedbackRate: '18.5%',
    rankTokenFactor: 4.18,
    rankSessionFactor: 4.2,
  },
  前三月: {
    days: 90,
    tokenTotal: '73.9 百万',
    sessionCount: 3864,
    avgDuration: '5m 9s',
    avgDurationSeconds: 309,
    completedSessions: 3656,
    inProgressSessions: 112,
    terminatedSessions: 96,
    completionRate: '94.6%',
    satisfied: 2461,
    dissatisfied: 344,
    noFeedback: 612,
    satisfiedRate: '72.0%',
    dissatisfiedRate: '10.1%',
    noFeedbackRate: '17.9%',
    rankTokenFactor: 12.55,
    rankSessionFactor: 12.7,
  },
  前半年: {
    days: 180,
    tokenTotal: '149.7 百万',
    sessionCount: 7812,
    avgDuration: '4m 56s',
    avgDurationSeconds: 296,
    completedSessions: 7385,
    inProgressSessions: 228,
    terminatedSessions: 199,
    completionRate: '94.5%',
    satisfied: 5160,
    dissatisfied: 628,
    noFeedback: 1120,
    satisfiedRate: '74.7%',
    dissatisfiedRate: '9.1%',
    noFeedbackRate: '16.2%',
    rankTokenFactor: 25.48,
    rankSessionFactor: 25.7,
  },
};

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

function formatTableDuration(totalSeconds: number) {
  return formatDuration(totalSeconds);
}

function formatDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function buildRanking(base: RankingItem[], config: PeriodConfig, periodIndex: number) {
  const feedbackTotal = config.satisfied + config.dissatisfied + config.noFeedback;
  const satisfiedRate = config.satisfied / feedbackTotal;
  const dissatisfiedRate = config.dissatisfied / feedbackTotal;

  return base
    .map((item, index) => {
      const variation = 1 + ((((index + periodIndex * 2) % 5) - 2) * 0.035);
      const sessionCount = Math.max(1, Math.round(item.sessions * config.rankSessionFactor * variation));
      const satisfied = Math.round(sessionCount * satisfiedRate);
      const dissatisfied = Math.round(sessionCount * dissatisfiedRate);
      const durationOffset = (((index * 17 + periodIndex * 29) % 75) - 37);
      const avgDurationSeconds = Math.max(180, config.avgDurationSeconds + durationOffset);
      return {
        ...item,
        token: Number((item.token * config.rankTokenFactor * variation).toFixed(1)),
        sessions: sessionCount,
        satisfied,
        dissatisfied,
        noFeedback: Math.max(0, sessionCount - satisfied - dissatisfied),
        avgDuration: formatDuration(avgDurationSeconds),
        avgDurationSeconds,
      };
    })
    .sort((a, b) => b.token - a.token)
    .map((item, index) => ({ ...item, id: index + 1 }));
}

function buildSessions(config: PeriodConfig, periodIndex: number): Session[] {
  const totalFeedback = config.satisfied + config.dissatisfied + config.noFeedback;
  const satisfiedThreshold = config.satisfied / totalFeedback;
  const dissatisfiedThreshold = satisfiedThreshold + (config.dissatisfied / totalFeedback);
  const rangeMinutes = config.days * 24 * 60;
  const endTimestamp = Date.UTC(2026, 6, 13, 18, 0, 0);
  const statuses: SessionStatus[] = [
    ...Array<SessionStatus>(config.completedSessions).fill('已完成'),
    ...Array<SessionStatus>(config.inProgressSessions).fill('进行中'),
    ...Array<SessionStatus>(config.terminatedSessions).fill('手动终止'),
  ];
  let shuffleSeed = 20260713 + periodIndex * 97;
  for (let index = statuses.length - 1; index > 0; index -= 1) {
    shuffleSeed = (shuffleSeed * 1664525 + 1013904223) >>> 0;
    const swapIndex = shuffleSeed % (index + 1);
    [statuses[index], statuses[swapIndex]] = [statuses[swapIndex], statuses[index]];
  }
  (['已完成', '进行中', '手动终止'] as SessionStatus[]).forEach((status, targetIndex) => {
    const currentIndex = statuses.indexOf(status, targetIndex);
    [statuses[targetIndex], statuses[currentIndex]] = [statuses[currentIndex], statuses[targetIndex]];
  });

  return Array.from({ length: config.sessionCount }, (_, index) => {
    const minuteOffset = Math.floor((index * rangeMinutes) / config.sessionCount) + ((index % 13) * 7);
    const started = new Date(endTimestamp - minuteOffset * 60 * 1000);
    const durationSeconds = 180 + ((index * 47 + periodIndex * 53) % 360);
    const ended = new Date(started.getTime() + durationSeconds * 1000);
    const status = statuses[index];
    const user = users[(index * 7 + periodIndex * 3) % users.length];
    const topic = topics[(index * 3 + periodIndex * 2) % topics.length];
    const feedbackSignal = ((index * 397 + periodIndex * 89) % 1000) / 1000;
    const feedback: Feedback = feedbackSignal < satisfiedThreshold
      ? '满意'
      : feedbackSignal < dissatisfiedThreshold
        ? '不满意'
        : '未反馈';
    const tokenValue = 21000 + ((index * 7919 + periodIndex * 1203) % 44000);

    return {
      id: periodIndex * 10000 + index + 1,
      query: queryTemplates[(index * 5 + periodIndex * 2) % queryTemplates.length],
      startedAt: formatDate(started),
      endedAt: status === '进行中' ? '-' : formatDate(ended),
      duration: formatTableDuration(durationSeconds),
      status,
      token: `${(tokenValue / 10000).toFixed(1)}万`,
      feedback,
      feedbackText: feedback === '不满意' ? feedbackReasons[(index + periodIndex) % feedbackReasons.length] : '-',
      user,
      topic,
    };
  });
}

export const dashboardData = timeRanges.reduce<Record<TimeRange, DashboardPeriod>>((result, range, periodIndex) => {
  const config = periodConfigs[range];
  result[range] = {
    metrics: {
      tokenTotal: config.tokenTotal,
      sessionCount: config.sessionCount,
      avgDuration: config.avgDuration,
      avgDurationSeconds: config.avgDurationSeconds,
      completedSessions: config.completedSessions,
      inProgressSessions: config.inProgressSessions,
      terminatedSessions: config.terminatedSessions,
      completionRate: config.completionRate,
      satisfied: config.satisfied,
      dissatisfied: config.dissatisfied,
      noFeedback: config.noFeedback,
      satisfiedRate: config.satisfiedRate,
      dissatisfiedRate: config.dissatisfiedRate,
      noFeedbackRate: config.noFeedbackRate,
    },
    userRanking: buildRanking(baseUserRanking, config, periodIndex),
    topicRanking: buildRanking(baseTopicRanking, config, periodIndex),
    sessions: buildSessions(config, periodIndex),
  };
  return result;
}, {} as Record<TimeRange, DashboardPeriod>);
