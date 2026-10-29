import { useState } from 'react'
import { AuthPanel } from './components/AuthPanel.jsx'
import { autocompleteText, uploadEventData } from './lib/api.js'
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

const initialEvents = [
  { id: 'product-forum', title: 'Product Forum', description: 'Practical sessions for teams building better customer experiences.', type: 'Customer education', date: 'Sep 24, 2024', attendance: '78%', feedback: '64%', score: '82', status: 'Strong' },
  { id: 'community-breakfast', title: 'Community Breakfast', description: 'A focused morning for community leaders to exchange ideas.', type: 'Community', date: 'Aug 12, 2024', attendance: '72%', feedback: '43%', score: '71', status: 'Good' },
  { id: 'partner-roundtable', title: 'Partner Roundtable', description: 'A working session for partners sharing practical growth lessons.', type: 'Partners', date: 'Jun 05, 2024', attendance: '91%', feedback: '81%', score: '89', status: 'Strong' },
]

function EventsView() {
  const [events, setEvents] = useState(initialEvents)
  const [editingEvent, setEditingEvent] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [draftDescription, setDraftDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  function startEditing(event) {
    setEditingEvent(event)
    setDraftTitle(event.title)
    setDraftDescription(event.description)
    setAiError('')
    setPendingDelete(null)
  }

  function saveEvent(event) {
    const title = draftTitle.trim()
    if (!title) return
    setEvents((currentEvents) => currentEvents.map((item) => item.id === event.id ? { ...item, title, description: draftDescription.trim() } : item))
    setEditingEvent(null)
  }

  async function suggestDescription() {
    setAiLoading(true)
    setAiError('')
    try {
      const result = await autocompleteText('description', `${draftTitle}. ${draftDescription}`)
      setDraftDescription(result.suggestion)
    } catch (error) {
      setAiError(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  function deleteEvent() {
    setEvents((currentEvents) => currentEvents.filter((item) => item.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  async function handleUpload(event) {
    event.preventDefault()
    if (!uploadFile) return
    setUploading(true)
    setUploadMessage('')
    try {
      const result = await uploadEventData(events[0].id, uploadFile)
      setUploadMessage(`${result.rows} rows imported successfully.`)
      setUploadFile(null)
      event.target.reset()
    } catch (error) {
      setUploadMessage(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="secondary-view events-view">
      <div className="page-intro"><div><span className="eyebrow">Event library</span><h1>Every event has a next move.</h1><p>Update event details or remove an event from your planning workspace.</p></div><button className="primary-button" type="button">+ Add event</button></div>
      {pendingDelete && <div className="delete-confirmation" role="alert"><span>Delete <strong>{pendingDelete.title}</strong>? This cannot be undone.</span><div><button className="quiet-button" onClick={() => setPendingDelete(null)} type="button">Cancel</button><button className="danger-button" onClick={deleteEvent} type="button">Delete event</button></div></div>}
      <div className="panel event-library">
        <div className="panel-heading"><div><h2>All events</h2><p>{events.length} events in your workspace</p></div><span className="tag success">Synced</span></div>
        <div className="event-table" role="table" aria-label="Event library">
          <div className="event-table-row event-table-header" role="row"><span>Event</span><span>Date</span><span>Attendance</span><span>Feedback</span><span>Score</span><span>Actions</span></div>
          {events.map((event) => (
            <div className="event-table-row" key={event.id} role="row">
              {editingEvent?.id === event.id ? <div className="inline-edit"><label htmlFor={`event-title-${event.id}`}>Event title</label><input id={`event-title-${event.id}`} value={draftTitle} onChange={(change) => setDraftTitle(change.target.value)} /><label htmlFor={`event-description-${event.id}`}>Description</label><textarea id={`event-description-${event.id}`} value={draftDescription} onChange={(change) => setDraftDescription(change.target.value)} /><button className="ai-button" disabled={aiLoading} onClick={suggestDescription} type="button">{aiLoading ? 'Thinking...' : '✦ Suggest with AI'}</button>{aiError && <span className="ai-error" role="alert">{aiError}</span>}</div> : <div><strong>{event.title}</strong><small>{event.type}</small></div>}
              <span>{event.date}</span><span>{event.attendance}</span><span>{event.feedback}</span><span><span className="tag success">{event.score} · {event.status}</span></span>
              <div className="row-actions">{editingEvent?.id === event.id ? <><button className="quiet-button" onClick={() => setEditingEvent(null)} type="button">Cancel</button><button className="save-button" onClick={() => saveEvent(event)} type="button">Save</button></> : <><button className="icon-button" aria-label={`Edit ${event.title}`} onClick={() => startEditing(event)} type="button">Edit</button><button className="icon-button danger-text" aria-label={`Delete ${event.title}`} onClick={() => setPendingDelete(event)} type="button">Delete</button></>}</div>
            </div>
          ))}
        </div>
      </div>
      <form className="panel upload-panel" onSubmit={handleUpload}>
        <div><span className="eyebrow">Data import</span><h2>Upload attendance and feedback</h2><p>Import a CSV with <code>email</code>, <code>name</code>, and optional <code>checkedIn</code>, <code>rating</code>, <code>comment</code>, and <code>returnIntent</code> columns.</p></div>
        <div className="upload-controls"><input accept=".csv,text/csv" aria-label="CSV data file" onChange={(event) => setUploadFile(event.target.files[0] || null)} type="file" /><button className="primary-button" disabled={!uploadFile || uploading} type="submit">{uploading ? 'Uploading...' : 'Upload CSV'}</button></div>
        {uploadMessage && <span className="upload-message" role="status">{uploadMessage}</span>}
      </form>
    </div>
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
        <header className="topbar"><span>Workspace / Event intelligence</span><AuthPanel /></header>
        {activeView === 'overview' ? <Overview onNavigate={setActiveView} /> : activeView === 'events' ? <EventsView /> : <SecondaryView view={activeView} />}
      </main>
    </div>
  )
}

export default App
