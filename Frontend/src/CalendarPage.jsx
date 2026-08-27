import React, { useEffect, useMemo, useState } from 'react'
import ImportModal from './ImportModal'

const STORAGE_KEY = 'tempus_tasks'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(value) { return String(value).padStart(2, '0') }
function toDateString(year, month, day) { return `${year}-${pad(month + 1)}-${pad(day)}` }
function todayString() {
  const today = new Date()
  return toDateString(today.getFullYear(), today.getMonth(), today.getDate())
}
function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function monthCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: firstDay + days }, (_, index) => {
    if (index < firstDay) return null
    return toDateString(year, month, index - firstDay + 1)
  })
}

export default function CalendarPage() {
  const now = new Date()
  const [tasks, setTasks] = useState(loadTasks)
  const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [viewMode, setViewMode] = useState('month')
  const [showImport, setShowImport] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [draft, setDraft] = useState(null)

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks])

  const tasksForDate = (date) => tasks.filter(task => task.date === date)
  const today = todayString()

  const saveImported = async (events) => {
    const imported = []
    for (const [index, event] of events.entries()) {
      const task = {
        title: event.title || `Imported item ${index + 1}`,
        description: event.source_text || '',
        date: event.date || today,
        priority: event.type === 'test' || event.type === 'quiz' ? 'high' : event.type === 'homework' ? 'medium' : 'low',
        completed: false,
        createdAt: new Date().toISOString()
      }
      try {
        const response = await fetch(`${API_BASE}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        })
        const body = await response.json().catch(() => null)
        imported.push(response.ok && body?.success && body.data ? body.data : { ...task, id: `import_${Date.now()}_${index}` })
      } catch {
        imported.push({ ...task, id: `import_${Date.now()}_${index}` })
      }
    }
    setTasks(current => [...current, ...imported])
  }

  const openNewTask = (date = today) => {
    setDraft({ id: null, title: '', description: '', date, priority: 'medium' })
  }
  const openEditTask = (task) => setDraft({ ...task })
  const saveDraft = () => {
    if (!draft.title.trim() || !draft.date) return
    setTasks(current => draft.id
      ? current.map(task => task.id === draft.id ? draft : task)
      : [...current, { ...draft, id: `task_${Date.now()}`, title: draft.title.trim(), createdAt: new Date().toISOString(), completed: false }])
    setDraft(null)
  }

  const changeMonth = (delta) => setViewDate(current => {
    const date = new Date(current.year, current.month + delta, 1)
    return { year: date.getFullYear(), month: date.getMonth() }
  })
  const changeYear = (delta) => setViewDate(current => ({ ...current, year: current.year + delta }))
  const jumpToDate = (date) => {
    const parsed = new Date(`${date}T00:00:00`)
    setViewDate({ year: parsed.getFullYear(), month: parsed.getMonth() })
    setViewMode('month')
  }

  const yearMonths = useMemo(() => Array.from({ length: 12 }, (_, month) => month), [viewDate.year])

  return (
    <div className="app-body-root">
      <header className="app-header">
        <h1>Tempus — Calendar</h1>
        <div>
          <button className="btn-import" onClick={() => setShowImport(true)}>Import Schedule</button>
          <button className="btn" onClick={() => openNewTask()}>+ Add Task</button>
        </div>
      </header>

      <div className="view-switcher">
        <button className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>Month</button>
        <button className={viewMode === 'year' ? 'active' : ''} onClick={() => setViewMode('year')}>Year</button>
      </div>

      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="cal-nav-btn" onClick={() => viewMode === 'year' ? changeYear(-1) : changeMonth(-1)}>←</button>
          <h2 className="cal-title">{viewMode === 'year' ? viewDate.year : `${MONTHS[viewDate.month]} ${viewDate.year}`}</h2>
          <button className="cal-nav-btn" onClick={() => viewMode === 'year' ? changeYear(1) : changeMonth(1)}>→</button>
          <button className="btn-today" onClick={() => setViewDate({ year: now.getFullYear(), month: now.getMonth() })}>Today</button>
        </div>
      </div>

      {viewMode === 'year' ? (
        <div className="year-grid">
          {yearMonths.map(month => (
            <section className="year-month" key={month}>
              <button className="year-month-title" onClick={() => { setViewDate({ year: viewDate.year, month }); setViewMode('month') }}>{MONTHS[month]}</button>
              <div className="year-weekdays">{WEEKDAYS.map(day => <span key={day}>{day[0]}</span>)}</div>
              <div className="year-days">
                {monthCells(viewDate.year, month).map((date, index) => date
                  ? <button key={date} className={date === today ? 'year-day today' : 'year-day'} onClick={() => jumpToDate(date)} title={tasksForDate(date).map(task => task.title).join(', ')}>
                      {new Date(`${date}T00:00:00`).getDate()}
                      <span className="event-dots">{tasksForDate(date).slice(0, 3).map(task => <i key={task.id} className={`event-dot ${task.priority}`} />)}</span>
                    </button>
                  : <span className="year-day empty" key={`empty-${index}`} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="month-layout">
          <aside className="sidebar">
            <h3>Overview</h3>
            <div className="stat-cards">
              <div className="stat-card"><span>Total Tasks</span><strong>{tasks.length}</strong></div>
              <div className="stat-card"><span>Due Today</span><strong>{tasksForDate(today).length}</strong></div>
            </div>
          </aside>
          <main className="main-content">
            <div className="calendar-grid">
              {WEEKDAYS.map(day => <div className="cal-dow-header" key={day}>{day}</div>)}
              {monthCells(viewDate.year, viewDate.month).map((date, index) => date
                ? <div className={`cal-cell ${date === today ? 'today' : ''}`} key={date} onClick={() => openNewTask(date)}>
                    <div className="cal-date-num">{new Date(`${date}T00:00:00`).getDate()}</div>
                    <div className="task-chips">{tasksForDate(date).slice(0, 3).map(task => <button className={`task-chip ${task.priority}`} key={task.id} onClick={(event) => { event.stopPropagation(); setSelectedTask(task) }}>{task.title}</button>)}</div>
                  </div>
                : <div className="cal-cell empty" key={`empty-${index}`} />)}
            </div>
          </main>
        </div>
      )}

      {draft && <div className="modal-overlay"><div className="modal">
        <button className="modal-close" onClick={() => setDraft(null)}>×</button>
        <div className="modal-title">{draft.id ? 'Edit Task' : 'New Task'}</div>
        <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></div>
        <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })} /></div>
        <div className="form-group"><label className="form-label">Priority</label><select className="form-input" value={draft.priority} onChange={event => setDraft({ ...draft, priority: event.target.value })}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
        <div className="modal-actions"><button className="btn-cancel" onClick={() => setDraft(null)}>Cancel</button><button className="btn-save" onClick={saveDraft}>Save Task</button></div>
      </div></div>}

      {selectedTask && <div className="task-detail-panel"><button className="detail-close" onClick={() => setSelectedTask(null)}>×</button><div className={`detail-priority-badge ${selectedTask.priority}`}>{selectedTask.priority}</div><div className="detail-title">{selectedTask.title}</div><div className="detail-date">📅 {selectedTask.date}</div><div className="detail-desc">{selectedTask.description}</div><div className="detail-actions"><button className="btn-complete" onClick={() => { setTasks(current => current.map(task => task.id === selectedTask.id ? { ...task, completed: !task.completed } : task)); setSelectedTask(null) }}>{selectedTask.completed ? 'Reopen' : 'Complete'}</button><button className="btn" onClick={() => { openEditTask(selectedTask); setSelectedTask(null) }}>Edit</button></div></div>}

      <ImportModal open={showImport} onClose={() => setShowImport(false)} onImported={saveImported} apiBase={API_BASE} />
    </div>
  )
}
