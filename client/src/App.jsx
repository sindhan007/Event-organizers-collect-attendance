import { useState } from 'react'
import './App.css'

const navigation = [
  { id: 'overview', label: 'Overview', icon: '◒' },
  { id: 'events', label: 'Events', icon: '▣' },
  { id: 'feedback', label: 'Feedback', icon: '✦' },
  { id: 'planning', label: 'Planning', icon: '↗' },
]

const metrics = [
  { label: 'Engagement score', value: '82', suffix: '/100', change: '14% vs last event' },
  { label: 'Attendance rate', value: '78%', change: '6% vs last event' },
  { label: 'Feedback collected', value: '64%', change: '21% vs last event' },
  { label: 'Return intent', value: '91%', change: '8% vs last event' },
]

function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark" /> gatherwell</div>
      <nav aria-label="Primary navigation">
        {navigation.map((item) => (
          <button
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <span className="nav-icon">{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        <strong>Make the next one matter.</strong>
        Turn attendance and attendee sentiment into a clear action plan.
      </div>
    </aside>
  )
}

function MetricCard({ label, value, suffix, change }) {
  return (
    <article className="metric-card">
      <span className="metric-label">{label}</span>
      <strong>{value}<small>{suffix}</small></strong>
      <span className="metric-change">↑ {change}</span>
    </article>
  )
}

function EngagementChart() {
  const months = [
    ['May', 44], ['Jun', 60], ['Jul', 51], ['Aug', 74], ['Sep', 68], ['Oct', 88],
  ]

  return (
    <article className="panel chart-panel">
      <div className="panel-heading">
        <div><h2>Engagement over time</h2><p>Registrations compared with attendees</p></div>
        <button className="text-button" type="button">Last 6 events ↗</button>
      </div>
      <div className="bar-chart" aria-label="Engagement over the last six events">
        {months.map(([month, height]) => (
          <div className="bar-column" key={month}>
            <div className="bar" style={{ height: `${height}%` }} />
            <span>{month}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function EventHealth({ onPlan }) {
  return (
    <article className="panel health-panel">
      <div className="panel-heading">
        <div><h2>Event health</h2><p>Product Forum · September 24</p></div>
        <span className="tag success">Strong</span>
      </div>
      <div className="health-score">
        <div className="score-ring"><strong>82</strong></div>
        <div><strong>Above your average</strong><p>Strong attendance and positive sentiment carried the score.</p></div>
      </div>
      <ProgressBar label="Attendance" value="78%" width="78%" />
      <ProgressBar label="Feedback coverage" value="64%" width="64%" tone="amber" />
      <div className="action-callout">
        <strong>One action to improve</strong>
        <p>Send the follow-up survey within 24 hours to lift response rate.</p>
        <button type="button" onClick={onPlan}>Open action plan →</button>
      </div>
    </article>
  )
}

function ProgressBar({ label, value, width, tone = 'green' }) {
  return (
    <div className="progress-group">
      <div className="progress-track"><i className={tone} style={{ width }} /></div>
      <div className="progress-label"><span>{label}</span><b>{value}</b></div>
    </div>
  )
}

function RecentEvents({ onEvents }) {
  const events = [
    ['24', 'SEP', 'Product Forum', '248 attendees · 64% feedback', '82 score', 'success'],
    ['12', 'AUG', 'Community Breakfast', '86 attendees · 43% feedback', '71 score', ''],
  ]

  return (
    <article className="panel recent-panel">
      <div className="panel-heading"><div><h2>Recent events</h2><p>A quick pulse on your latest work</p></div><button className="text-button" onClick={onEvents} type="button">View all events →</button></div>
      {events.map(([day, month, name, detail, score, tone]) => (
        <div className="event-row" key={name}>
          <div className="date-tile"><strong>{day}</strong>{month}</div>
          <div><strong>{name}</strong><p>{detail}</p></div>
          <span className={`tag ${tone}`}>{score}</span>
        </div>
      ))}
    </article>
  )
}

function Overview({ onNavigate }) {
  return (
    <>
      <div className="page-intro"><div><span className="eyebrow">Monday, 14 October</span><h1>Your events, with the full story.</h1><p>See who showed up, what resonated, and what to do next.</p></div><select aria-label="Select event"><option>All events · 2024</option><option>Product Forum · Sep 24</option></select></div>
      <div className="metrics">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>
      <div className="dashboard-grid"><EngagementChart /><EventHealth onPlan={() => onNavigate('planning')} /></div>
      <RecentEvents onEvents={() => onNavigate('events')} />
    </>
  )
}

function SecondaryView({ view }) {
  const content = {
    events: ['Event library', 'Every event has a next move.', 'Compare the moments that shaped your audience experience.'],
    feedback: ['Voice of the room', 'Feedback that points somewhere.', 'Spot what attendees valued and where the experience can move forward.'],
    planning: ['Plan with evidence', 'Turn insight into the next brief.', 'Carry your strongest signals into the decisions that shape the next event.'],
  }[view]
  return <div className="secondary-view"><span className="eyebrow">{content[0]}</span><h1>{content[1]}</h1><p>{content[2]}</p><div className="empty-panel"><span className="empty-icon">✦</span><h2>{view === 'planning' ? 'Action plan ready' : 'Component coming next'}</h2><p>The navigation and view shell are ready for the next capstone slice.</p></div></div>
}

function App() {
  const [activeView, setActiveView] = useState('overview')

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="main-content">
        <header className="topbar"><span>Workspace / Event intelligence</span><div className="profile"><span>Alex Morgan</span><b>AM</b></div></header>
        {activeView === 'overview' ? <Overview onNavigate={setActiveView} /> : <SecondaryView view={activeView} />}
      </main>
    </div>
  )
}

export default App
