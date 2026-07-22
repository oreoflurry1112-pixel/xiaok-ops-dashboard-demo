import { useEffect, useMemo, useState } from 'react';
import {
  ChartColumn,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  Database,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  MessageCircleQuestion,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Table2,
  X,
} from 'lucide-react';
import {
  ALL_USERS,
  MetricCards,
  RankingPanel,
  SessionPanel,
} from './App';
import { timeRanges, type RankingItem, type TimeRange } from './data';
import { buildTopicDashboardPeriod } from './topicData';

const DEFAULT_TOPIC = '网站流量分析1';
type SettingsSection = 'basic' | 'assistant' | 'operations';

export default function TopicDashboard() {
  const topicName = useMemo(() => new URLSearchParams(window.location.search).get('topic')?.trim() || DEFAULT_TOPIC, []);
  const [timeRange, setTimeRange] = useState<TimeRange>('前一周');
  const [detailUser, setDetailUser] = useState(ALL_USERS);
  const [entrySearch, setEntrySearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('basic');
  const [topicDescription, setTopicDescription] = useState('');
  const currentData = useMemo(() => buildTopicDashboardPeriod(topicName, timeRange), [timeRange, topicName]);
  const dashboardHref = `./topic-dashboard.html?topic=${encodeURIComponent(topicName)}`;

  useEffect(() => {
    document.title = `${topicName} - 运营看板`;
  }, [topicName]);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [settingsOpen]);

  const changeTimeRange = (nextRange: TimeRange) => {
    setTimeRange(nextRange);
    setDetailUser(ALL_USERS);
  };

  const selectRanking = (item: RankingItem) => {
    setDetailUser(item.name);
  };

  return (
    <div className="topic-workspace">
      <header className="topic-topbar">
        <div className="topic-identity">
          <a className="topic-back" href="./" aria-label="返回问数运营看板"><ChevronLeft size={20} /></a>
          <span className="topic-symbol" aria-hidden="true"><ChartNoAxesCombined size={18} /></span>
          <strong>{topicName}</strong>
        </div>
        <button
          className="topic-settings"
          type="button"
          aria-label="主题设置"
          title="主题设置"
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          onClick={() => {
            setSettingsSection('basic');
            setSettingsOpen(true);
          }}
        ><Settings size={19} /></button>
      </header>

      <aside className="topic-sidebar" aria-label="主题资源导航">
        <div className="topic-sidebar-tools">
          <label className="topic-search"><Search size={16} /><input value={entrySearch} onChange={(event) => setEntrySearch(event.target.value)} placeholder="输入名称搜索" /></label>
          <button type="button" aria-label="新建资源" title="新建资源"><Plus size={18} /></button>
          <button type="button" aria-label="刷新资源" title="刷新资源"><RefreshCw size={17} /></button>
          <button type="button" aria-label="收起导航" title="收起导航"><PanelLeftClose size={18} /></button>
        </div>

        <nav className="topic-tree">
          {!entrySearch.trim() && (
            <>
              <section>
                <button className="topic-tree-parent" type="button"><ChevronDown size={15} /><Database size={16} /><span>数据</span><small>(0)</small></button>
                <div className="topic-tree-children">
                  <button type="button"><Table2 size={15} /><span>数据源表</span><small>(0)</small></button>
                  <button type="button"><Table2 size={15} /><span>分析表</span><small>(0)</small></button>
                </div>
              </section>
              <section><button className="topic-tree-parent" type="button"><ChartColumn size={16} /><span>图表</span><small>(0)</small></button></section>
              <section><button className="topic-tree-parent" type="button"><LayoutDashboard size={16} /><span>仪表板</span><small>(0)</small></button></section>
            </>
          )}
          {entrySearch.trim() && <p className="topic-tree-empty">未找到匹配内容</p>}
        </nav>

        <button className="topic-new-button" type="button"><Plus size={18} /><span>新建</span></button>
      </aside>

      <main className="topic-main" id="topic-dashboard">
        <section className="page-heading topic-page-heading">
          <div><h1>运营看板</h1><p>{topicName} · 问数使用情况与会话质量</p></div>
          <label className="time-filter"><span>发生时间</span><select value={timeRange} onChange={(event) => changeTimeRange(event.target.value as TimeRange)}>{timeRanges.map((range) => <option key={range}>{range}</option>)}</select></label>
        </section>
        <MetricCards metrics={currentData.metrics} />
        <div className="dashboard-grid topic-dashboard-grid">
          <RankingPanel key={`${timeRange}-topic-ranking`} mode="用户" setMode={() => undefined} onSelect={selectRanking} userRanking={currentData.userRanking} topicRanking={[]} allowModeSwitch={false} />
          <SessionPanel
            key={`${timeRange}-topic-sessions`}
            sessionsData={currentData.sessions}
            metrics={currentData.metrics}
            user={detailUser}
            topic={topicName}
            onUserChange={setDetailUser}
            onTopicChange={() => undefined}
            onReset={() => setDetailUser(ALL_USERS)}
            allowTopicFilter={false}
          />
        </div>
      </main>

      {settingsOpen && (
        <div
          className="topic-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSettingsOpen(false);
          }}
        >
          <section className="topic-settings-modal" role="dialog" aria-modal="true" aria-labelledby="topic-settings-title">
            <header className="topic-modal-header">
              <h2 id="topic-settings-title">设置</h2>
              <button type="button" aria-label="关闭设置" title="关闭" onClick={() => setSettingsOpen(false)}><X size={20} /></button>
            </header>

            <div className="topic-settings-layout">
              <nav className="topic-settings-menu" aria-label="设置菜单">
                <button className={settingsSection === 'basic' ? 'active' : ''} type="button" onClick={() => setSettingsSection('basic')}><FileText size={17} /><span>基础信息</span></button>
                <button className={settingsSection === 'assistant' ? 'active' : ''} type="button" onClick={() => setSettingsSection('assistant')}><MessageCircleQuestion size={17} /><span>智能问数</span></button>
                <button className={settingsSection === 'operations' ? 'active' : ''} type="button" onClick={() => setSettingsSection('operations')}><ChartNoAxesCombined size={17} /><span>运营看板</span></button>
              </nav>

              <div className="topic-settings-content">
                {settingsSection === 'basic' && (
                  <form className="topic-settings-form" onSubmit={(event) => event.preventDefault()}>
                    <label><span>分析主题名称</span><input defaultValue={topicName} /></label>
                    <label><span>分析主题描述</span><textarea value={topicDescription} onChange={(event) => setTopicDescription(event.target.value)} placeholder="请输入分析主题描述" /></label>
                  </form>
                )}

                {settingsSection === 'assistant' && (
                  <section className="topic-settings-pane">
                    <h3>智能问数</h3>
                    <p>配置当前主题的智能问数体验。</p>
                    <label className="topic-switch-row"><span><b>启用智能问数</b><small>允许主题成员使用自然语言分析当前主题数据</small></span><input type="checkbox" defaultChecked /></label>
                  </section>
                )}

                {settingsSection === 'operations' && (
                  <section className="topic-settings-pane topic-operations-pane">
                    <div className="topic-operations-heading">
                      <span aria-hidden="true"><ChartNoAxesCombined size={22} /></span>
                      <div><h3>运营看板</h3><p>查看当前主题的问数使用情况与会话质量。</p></div>
                    </div>
                    <dl>
                      <div><dt>主题范围</dt><dd>{topicName}</dd></div>
                      <div><dt>内容权限</dt><dd><LockKeyhole size={15} />系统生成，仅支持查看</dd></div>
                    </dl>
                  </section>
                )}
              </div>
            </div>

            <footer className="topic-modal-footer">
              <button className="topic-modal-secondary" type="button" onClick={() => setSettingsOpen(false)}>取消</button>
              {settingsSection === 'operations' ? (
                <a className="topic-modal-primary" href={dashboardHref} onClick={() => setSettingsOpen(false)}>打开运营看板</a>
              ) : (
                <button className="topic-modal-primary" type="button" onClick={() => setSettingsOpen(false)}>保存</button>
              )}
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
