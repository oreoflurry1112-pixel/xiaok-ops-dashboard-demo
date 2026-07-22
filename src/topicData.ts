import {
  dashboardData,
  type DashboardPeriod,
  type PeriodMetrics,
  type RankingItem,
  type Session,
  type TimeRange,
} from './data';

function parseDuration(value: string) {
  const hours = Number(value.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(value.match(/(\d+)m/)?.[1] ?? 0);
  const seconds = Number(value.match(/(\d+)s/)?.[1] ?? 0);
  return (hours * 3600) + (minutes * 60) + seconds;
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

function formatRate(value: number, total: number) {
  return total === 0 ? '0.0%' : `${((value / total) * 100).toFixed(1)}%`;
}

function aggregateUserRanking(sessions: Session[]): RankingItem[] {
  const grouped = new Map<string, Omit<RankingItem, 'id' | 'avgDuration'> & { durationTotal: number }>();

  sessions.forEach((session) => {
    const current = grouped.get(session.user) ?? {
      name: session.user,
      token: 0,
      sessions: 0,
      satisfied: 0,
      dissatisfied: 0,
      noFeedback: 0,
      avgDurationSeconds: 0,
      durationTotal: 0,
    };
    current.token += Number.parseFloat(session.token);
    current.sessions += 1;
    current.satisfied += session.feedback === '满意' ? 1 : 0;
    current.dissatisfied += session.feedback === '不满意' ? 1 : 0;
    current.noFeedback += session.feedback === '未反馈' ? 1 : 0;
    current.durationTotal += parseDuration(session.duration);
    grouped.set(session.user, current);
  });

  return [...grouped.values()]
    .map((item) => {
      const avgDurationSeconds = Math.round(item.durationTotal / item.sessions);
      return {
        id: 0,
        name: item.name,
        token: Number(item.token.toFixed(1)),
        sessions: item.sessions,
        satisfied: item.satisfied,
        dissatisfied: item.dissatisfied,
        noFeedback: item.noFeedback,
        avgDuration: formatDuration(avgDurationSeconds),
        avgDurationSeconds,
      };
    })
    .sort((a, b) => b.token - a.token)
    .map((item, index) => ({ ...item, id: index + 1 }));
}

function aggregateMetrics(sessions: Session[]): PeriodMetrics {
  const sessionCount = sessions.length;
  const durationTotal = sessions.reduce((total, session) => total + parseDuration(session.duration), 0);
  const avgDurationSeconds = sessionCount === 0 ? 0 : Math.round(durationTotal / sessionCount);
  const completedSessions = sessions.filter((session) => session.status === '已完成').length;
  const inProgressSessions = sessions.filter((session) => session.status === '进行中').length;
  const terminatedSessions = sessions.filter((session) => session.status === '手动终止').length;
  const satisfied = sessions.filter((session) => session.feedback === '满意').length;
  const dissatisfied = sessions.filter((session) => session.feedback === '不满意').length;
  const noFeedback = sessions.filter((session) => session.feedback === '未反馈').length;
  const tokenWan = sessions.reduce((total, session) => total + Number.parseFloat(session.token), 0);

  return {
    tokenTotal: tokenWan >= 100 ? `${(tokenWan / 100).toFixed(1)} 百万` : `${tokenWan.toFixed(1)} 万`,
    sessionCount,
    avgDuration: formatDuration(avgDurationSeconds),
    avgDurationSeconds,
    completedSessions,
    inProgressSessions,
    terminatedSessions,
    completionRate: formatRate(completedSessions, sessionCount),
    satisfied,
    dissatisfied,
    noFeedback,
    satisfiedRate: formatRate(satisfied, sessionCount),
    dissatisfiedRate: formatRate(dissatisfied, sessionCount),
    noFeedbackRate: formatRate(noFeedback, sessionCount),
  };
}

function topicHash(topicName: string) {
  return [...topicName].reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function buildTopicDashboardPeriod(topicName: string, range: TimeRange): DashboardPeriod {
  const period = dashboardData[range];
  const availableTopics = [...new Set(period.sessions.map((session) => session.topic))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const sourceTopic = availableTopics[topicHash(topicName) % availableTopics.length];
  const sessions = period.sessions
    .filter((session) => session.topic === sourceTopic)
    .map((session) => ({ ...session, topic: topicName }));

  return {
    metrics: aggregateMetrics(sessions),
    userRanking: aggregateUserRanking(sessions),
    topicRanking: [],
    sessions,
  };
}
