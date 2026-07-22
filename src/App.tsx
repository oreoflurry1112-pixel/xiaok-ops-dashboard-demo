import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Database,
  Image,
  Search,
} from 'lucide-react';
import {
  dashboardData,
  timeRanges,
  type Feedback,
  type PeriodMetrics,
  type RankingItem,
  type Session,
  type SessionStatus,
  type TimeRange,
} from './data';

export type RankingMode = '用户' | '主题';
type FeedbackFilter = '全部' | '有反馈' | '不满意反馈';
type StatusFilter = '全部状态' | SessionStatus;
type RankingSortKey = 'token' | 'sessions' | 'avgDurationSeconds';

export const ALL_USERS = '全部用户';
export const ALL_TOPICS = '全部主题';
const ALL_STATUSES: StatusFilter = '全部状态';

const navItems = ['小K', '工作台', '数据门户', '系统菜单'];
const sideItems = [
  { label: '数据连接', icon: Database },
  { label: '小K日志', icon: CircleGauge },
  { label: '个人图片库', icon: Image },
];

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="brand-dot brand-dot-a" />
      <span className="brand-dot brand-dot-b" />
      <span className="brand-dot brand-dot-c" />
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value: T; onChange: (next: T) => void; label: string }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option} className={value === option ? 'is-selected' : ''} onClick={() => onChange(option)} type="button">
          {option}
        </button>
      ))}
    </div>
  );
}

function SearchableSelect({ label, value, allLabel, options, onChange }: { label: string; value: string; allLabel: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const availableOptions = useMemo(() => [allLabel, ...options], [allLabel, options]);
  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? availableOptions.filter((option) => option.toLowerCase().includes(normalizedQuery))
      : availableOptions;
  }, [availableOptions, query]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const selectOption = (option: string) => {
    onChange(option);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className={`searchable-select${open ? ' is-open' : ''}`} ref={rootRef}>
      <div className="searchable-select-control">
        <Search size={14} />
        <input
          aria-label={`${label}，可输入搜索`}
          aria-expanded={open}
          aria-controls={`${label}-options`}
          role="combobox"
          value={open ? query : value}
          onFocus={() => { setQuery(''); setOpen(true); }}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
            if (event.key === 'Enter' && visibleOptions.length === 1) {
              event.preventDefault();
              selectOption(visibleOptions[0]);
            }
          }}
        />
        <button type="button" aria-label={`展开${label}选项`} onClick={() => { setQuery(''); setOpen((value) => !value); }}><ChevronDown size={14} /></button>
      </div>
      {open && (
        <div className="searchable-select-menu" id={`${label}-options`} role="listbox" aria-label={`${label}选项`}>
          {visibleOptions.map((option) => (
            <button key={option} className={option === value ? 'is-selected' : ''} type="button" role="option" aria-selected={option === value} onMouseDown={(event) => event.preventDefault()} onClick={() => selectOption(option)}>{option}</button>
          ))}
          {visibleOptions.length === 0 && <p>无匹配选项</p>}
        </div>
      )}
    </div>
  );
}

export function MetricCards({ metrics }: { metrics: PeriodMetrics }) {
  return (
    <section className="metrics" aria-label="核心指标">
      <article className="metric-card">
        <span>Token总用量</span>
        <strong>{metrics.tokenTotal}</strong>
      </article>
      <article className="metric-card metric-feedback">
        <div>
          <span>发起会话数量</span>
          <strong>{metrics.sessionCount.toLocaleString('zh-CN')}</strong>
        </div>
        <dl className="feedback-summary">
          <div className="positive"><dt>满意</dt><dd>{metrics.satisfied.toLocaleString('zh-CN')} 次</dd><b>{metrics.satisfiedRate}</b></div>
          <div className="negative"><dt>不满意</dt><dd>{metrics.dissatisfied.toLocaleString('zh-CN')} 次</dd><b>{metrics.dissatisfiedRate}</b></div>
          <div className="neutral"><dt>未反馈</dt><dd>{metrics.noFeedback.toLocaleString('zh-CN')} 次</dd><b>{metrics.noFeedbackRate}</b></div>
        </dl>
      </article>
      <article className="metric-card">
        <span>平均时长</span>
        <strong>{metrics.avgDuration}</strong>
      </article>
      <article className="metric-card metric-completion">
        <div className="completion-primary">
          <span>完成率</span>
          <strong>{metrics.completionRate}</strong>
        </div>
        <p className="completion-count">
          <span>已完成</span>
          <b>{metrics.completedSessions.toLocaleString('zh-CN')}</b>
          <i>/</i>
          <em>{metrics.sessionCount.toLocaleString('zh-CN')}</em>
        </p>
      </article>
    </section>
  );
}

export function RankingPanel({ mode, setMode, onSelect, userRanking, topicRanking, allowModeSwitch = true }: { mode: RankingMode; setMode: (mode: RankingMode) => void; onSelect: (item: RankingItem) => void; userRanking: RankingItem[]; topicRanking: RankingItem[]; allowModeSwitch?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [sortKey, setSortKey] = useState<RankingSortKey>('token');
  const rankingSource = mode === '用户' ? userRanking : topicRanking;
  const ranking = useMemo(
    () => [...rankingSource].sort((a, b) => b[sortKey] - a[sortKey]),
    [rankingSource, sortKey],
  );
  const rows = expanded ? ranking : ranking.slice(0, 10);
  const max = Math.max(...ranking.map((item) => item.token));

  const changeMode = (next: RankingMode) => {
    setMode(next);
  };

  return (
    <section className="panel ranking-panel">
      <header className="panel-header">
        <div>
          <h2>使用量排名</h2>
          <p>默认展示前10名，点击展开查看更多</p>
        </div>
        {allowModeSwitch && <Segmented options={['用户', '主题'] as const} value={mode} onChange={changeMode} label="排名类型" />}
      </header>
      <div className="ranking-scroll">
        <div className="ranking-table" role="table" aria-label={`${mode}使用量排名`}>
        <div className="ranking-head" role="row">
          <span>排名</span>
          <span>{mode}</span>
          <button className={`sort-button${sortKey === 'token' ? ' is-active' : ''}`} type="button" onClick={() => setSortKey('token')} aria-pressed={sortKey === 'token'}>Token{sortKey === 'token' && <ArrowDown size={12} />}</button>
          <button className={`sort-button${sortKey === 'sessions' ? ' is-active' : ''}`} type="button" onClick={() => setSortKey('sessions')} aria-pressed={sortKey === 'sessions'}>会话数{sortKey === 'sessions' && <ArrowDown size={12} />}</button>
          <button className={`sort-button${sortKey === 'avgDurationSeconds' ? ' is-active' : ''}`} type="button" onClick={() => setSortKey('avgDurationSeconds')} aria-pressed={sortKey === 'avgDurationSeconds'}>平均时长{sortKey === 'avgDurationSeconds' && <ArrowDown size={12} />}</button>
        </div>
        {rows.map((item, index) => {
          return (
            <button
              type="button"
              className="ranking-row"
              key={item.name}
              onClick={() => onSelect(item)}
            >
              <span className="rank-badge">{index + 1}</span>
              <strong className="rank-name">{item.name}</strong>
                <span className="token-cell"><b>{item.token.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 万</b><i><em style={{ width: `${(item.token / max) * 100}%` }} /></i></span>
              <span className="session-cell"><b>{item.sessions}</b><small>满意 {item.satisfied}&nbsp; 不满意 {item.dissatisfied}&nbsp; 未反馈 {item.noFeedback}</small></span>
              <span className="duration-cell">{item.avgDuration}</span>
            </button>
          );
        })}
        </div>
      </div>
      {ranking.length > 10 && (
        <button className="expand-button" type="button" onClick={() => setExpanded((value) => !value)}>
          <ChevronDown size={15} className={expanded ? 'rotate' : ''} />
          {expanded ? '收起' : '展开更多'}
        </button>
      )}
    </section>
  );
}

function FeedbackBadge({ value }: { value: Feedback }) {
  return <span className={`feedback-badge ${value === '满意' ? 'good' : value === '不满意' ? 'bad' : 'none'}`}>{value}</span>;
}

function StatusBadge({ value }: { value: SessionStatus }) {
  return <span className={`status-badge ${value === '已完成' ? 'completed' : value === '进行中' ? 'progressing' : 'terminated'}`}>{value}</span>;
}

export function SessionPanel({ sessionsData, metrics, user, topic, onUserChange, onTopicChange, onReset, allowTopicFilter = true }: { sessionsData: Session[]; metrics: PeriodMetrics; user: string; topic: string; onUserChange: (value: string) => void; onTopicChange: (value: string) => void; onReset: () => void; allowTopicFilter?: boolean }) {
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('全部');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUSES);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const baseFiltered = useMemo(() => sessionsData.filter((item) => {
    const feedbackMatch = feedbackFilter === '全部' || (feedbackFilter === '有反馈' ? item.feedback !== '未反馈' : item.feedback === '不满意');
    const statusMatch = statusFilter === ALL_STATUSES || item.status === statusFilter;
    const query = search.trim().toLowerCase();
    const searchMatch = !query || `${item.query}${item.feedbackText}${item.user}${item.topic}${item.status}`.toLowerCase().includes(query);
    return feedbackMatch && statusMatch && searchMatch;
  }), [feedbackFilter, search, sessionsData, statusFilter]);
  const users = useMemo(
    () => [...new Set(baseFiltered.filter((item) => topic === ALL_TOPICS || item.topic === topic).map((item) => item.user))],
    [baseFiltered, topic],
  );
  const topics = useMemo(
    () => [...new Set(baseFiltered.filter((item) => user === ALL_USERS || item.user === user).map((item) => item.topic))],
    [baseFiltered, user],
  );
  const filtered = useMemo(() => baseFiltered.filter((item) => (
    (user === ALL_USERS || item.user === user) && (topic === ALL_TOPICS || item.topic === topic)
  )), [baseFiltered, topic, user]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, topic, user]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const visibleRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const reset = () => {
    setFeedbackFilter('全部');
    setStatusFilter(ALL_STATUSES);
    setSearch('');
    setPage(1);
    onReset();
  };

  return (
    <section className="panel session-panel">
      <header className="session-title">
        <h2>会话明细表</h2>
      </header>
      <div className="filters">
        <div className="filter-row">
          <span className="filter-label">用户反馈</span>
          <Segmented options={['全部', '有反馈', '不满意反馈'] as const} value={feedbackFilter} onChange={(next) => { setFeedbackFilter(next); setPage(1); }} label="用户反馈" />
          <label className="search-box"><Search size={15} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={allowTopicFilter ? '搜索提问内容、反馈内容、用户或主题' : '搜索提问内容、反馈内容或用户'} /></label>
        </div>
        <div className="filter-row filter-row-secondary">
          <div className="filter-field"><span>发起用户</span><SearchableSelect label="发起用户" value={user} allLabel={ALL_USERS} options={users} onChange={onUserChange} /></div>
          {allowTopicFilter && <div className="filter-field"><span>询问主题</span><SearchableSelect label="询问主题" value={topic} allLabel={ALL_TOPICS} options={topics} onChange={onTopicChange} /></div>}
          <label className="filter-field"><span>运行状态</span><select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}><option>{ALL_STATUSES}</option><option>已完成</option><option>进行中</option><option>手动终止</option></select></label>
          <button type="button" className="reset-button" onClick={reset}>重置</button>
        </div>
      </div>
      <div className="session-table-wrap">
        <table className="session-table">
          <thead><tr><th>会话提问内容</th><th>发生时间</th><th>结束时间</th><th>时长</th><th>Token</th><th>用户反馈</th><th>反馈内容</th><th>运行状态</th><th>发起用户</th><th>询问主题</th></tr></thead>
          <tbody>
            {visibleRows.map((item) => (
              <tr key={item.id}><td title={item.query}>{item.query}</td><td>{item.startedAt}</td><td>{item.endedAt}</td><td>{item.duration}</td><td>{item.token}</td><td><FeedbackBadge value={item.feedback} /></td><td title={item.feedbackText}>{item.feedbackText}</td><td><StatusBadge value={item.status} /></td><td><strong>{item.user}</strong></td><td><strong>{item.topic}</strong></td></tr>
            ))}
            {visibleRows.length === 0 && <tr><td className="empty-state" colSpan={10}>没有找到符合条件的会话</td></tr>}
          </tbody>
        </table>
      </div>
      <footer className="table-footer">
        <div><b>总计{filtered.length.toLocaleString('zh-CN')}条</b><span>/ 平均时长：{metrics.avgDuration}</span><span>/ Token总计：{metrics.tokenTotal}</span><span>/ 有效反馈数：{filtered.filter((item) => item.feedback !== '未反馈').length.toLocaleString('zh-CN')}</span></div>
        <nav className="pagination" aria-label="会话分页">
          <span>共{pages}页</span>
          <button type="button" onClick={() => setPage(1)} disabled={safePage === 1} aria-label="第一页"><ChevronFirst size={15} /></button>
          <button type="button" onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1} aria-label="上一页"><ChevronLeft size={15} /></button>
          <span>第 <b>{safePage}</b> 页</span>
          <button type="button" onClick={() => setPage(Math.min(pages, safePage + 1))} disabled={safePage === pages} aria-label="下一页"><ChevronRight size={15} /></button>
          <button type="button" onClick={() => setPage(pages)} disabled={safePage === pages} aria-label="最后一页"><ChevronLast size={15} /></button>
          <span>{pageSize}条 / 页</span>
        </nav>
      </footer>
    </section>
  );
}

export default function App() {
  const [rankingMode, setRankingMode] = useState<RankingMode>('用户');
  const [detailUser, setDetailUser] = useState(ALL_USERS);
  const [detailTopic, setDetailTopic] = useState(ALL_TOPICS);
  const [detailLinkVersion, setDetailLinkVersion] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('前一周');
  const currentData = dashboardData[timeRange];

  const changeTimeRange = (nextRange: TimeRange) => {
    setTimeRange(nextRange);
  };

  const selectRanking = (item: RankingItem) => {
    setDetailUser(rankingMode === '用户' ? item.name : ALL_USERS);
    setDetailTopic(rankingMode === '主题' ? item.name : ALL_TOPICS);
    setDetailLinkVersion((version) => version + 1);
  };

  const changeDetailUser = (value: string) => {
    setDetailUser(value);
  };

  const changeDetailTopic = (value: string) => {
    setDetailTopic(value);
  };

  const resetDetailFilters = () => {
    setDetailUser(ALL_USERS);
    setDetailTopic(ALL_TOPICS);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="ABI 首页"><BrandMark /><strong>ABI</strong></a>
        <nav>{navItems.map((item) => <a className={item === '系统菜单' ? 'active' : ''} href={`#${item}`} key={item}>{item}</a>)}</nav>
      </header>
      <aside className="sidebar">
        {sideItems.map(({ label, icon: Icon }) => <button className={label === '小K日志' ? 'active' : ''} type="button" key={label}><Icon size={16} /><span>{label}</span></button>)}
      </aside>
      <main id="top">
        <section className="page-heading">
          <div><h1>小K问数日志</h1><p>按用户、主题、时间段与反馈查看平台使用量、会话质量和 Token 消耗。</p></div>
          <label className="time-filter"><span>发生时间</span><select value={timeRange} onChange={(event) => changeTimeRange(event.target.value as TimeRange)}>{timeRanges.map((range) => <option key={range}>{range}</option>)}</select></label>
        </section>
        <MetricCards metrics={currentData.metrics} />
        <div className="dashboard-grid">
          <RankingPanel key={`${timeRange}-ranking`} mode={rankingMode} setMode={setRankingMode} onSelect={selectRanking} userRanking={currentData.userRanking} topicRanking={currentData.topicRanking} />
          <SessionPanel key={`${timeRange}-sessions-${detailLinkVersion}`} sessionsData={currentData.sessions} metrics={currentData.metrics} user={detailUser} topic={detailTopic} onUserChange={changeDetailUser} onTopicChange={changeDetailTopic} onReset={resetDetailFilters} />
        </div>
      </main>
    </div>
  );
}
