import { useState } from 'react'
import Dashboard from './components/Dashboard'
import SleepTracker from './components/SleepTracker'
import DreamJournal from './components/DreamJournal'
import Insights from './components/Insights'
import { useLocalStorage } from './lib/storage'
import { seedDreams, seedSleepEntries } from './lib/sampleData'
import { formatDate, todayISO, uid } from './lib/utils'

const TABS = [
  { id: 'tonight', label: 'Tonight' },
  { id: 'sleep', label: 'Sleep log' },
  { id: 'dreams', label: 'Dreams' },
  { id: 'insights', label: 'Insights' },
]

function TabIcon({ id }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  if (id === 'tonight') {
    return (
      <svg {...common}>
        <path d="M20.6 14.2A8.4 8.4 0 0 1 9.8 3.4a8.6 8.6 0 1 0 10.8 10.8z" />
      </svg>
    )
  }
  if (id === 'sleep') {
    return (
      <svg {...common}>
        <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
        <path d="M3 14h18M7 10V7h10v3" />
      </svg>
    )
  }
  if (id === 'dreams') {
    return (
      <svg {...common}>
        <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-4-3H6a2 2 0 0 1-2-2z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M4 20V6M10 20v-9M16 20v-5M22 20H2" />
    </svg>
  )
}

export default function App() {
  const [tab, setTab] = useState('tonight')
  const [sleepEntries, setSleepEntries] = useLocalStorage('dreammy.sleep.v1', seedSleepEntries)
  const [dreams, setDreams] = useLocalStorage('dreammy.dreams.v1', seedDreams)

  function saveSleep(entry) {
    // New entries arrive without an id — the store owns identity.
    const saved = { ...entry, id: entry.id || uid() }
    setSleepEntries((list) =>
      list.some((e) => e.id === saved.id)
        ? list.map((e) => (e.id === saved.id ? saved : e))
        : [...list, saved],
    )
  }

  function deleteSleep(id) {
    if (!window.confirm('Delete this night?')) return
    setSleepEntries((list) => list.filter((e) => e.id !== id))
  }

  function saveDream(dream) {
    const saved = { ...dream, id: dream.id || uid() }
    setDreams((list) =>
      list.some((d) => d.id === saved.id)
        ? list.map((d) => (d.id === saved.id ? saved : d))
        : [...list, saved],
    )
  }

  function deleteDream(id) {
    if (!window.confirm('Delete this dream?')) return
    setDreams((list) => list.filter((d) => d.id !== id))
  }

  function loadSample() {
    if (!window.confirm('Replace current data with the sample week?')) return
    setSleepEntries(seedSleepEntries())
    setDreams(seedDreams())
    setTab('tonight')
  }

  function clearAll() {
    if (!window.confirm('Delete every night and dream? This cannot be undone.')) return
    setSleepEntries([])
    setDreams([])
  }

  return (
    <div className="app">
      <div className="stars" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M20.6 14.2A8.4 8.4 0 0 1 9.8 3.4a8.6 8.6 0 1 0 10.8 10.8z"
                fill="currentColor"
              />
            </svg>
          </span>
          <div>
            <h1 className="brand__name">Dreammy</h1>
            <p className="brand__tag">
              {formatDate(todayISO(), { weekday: 'long', day: 'numeric', month: 'long' })} · sleep &
              dream journal
            </p>
          </div>
        </div>
        <nav className="tabs" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              <TabIcon id={t.id} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'tonight' ? (
          <Dashboard
            sleepEntries={sleepEntries}
            dreams={dreams}
            onLogSleep={() => setTab('sleep')}
            onGoTo={setTab}
          />
        ) : null}
        {tab === 'sleep' ? (
          <SleepTracker entries={sleepEntries} onSave={saveSleep} onDelete={deleteSleep} />
        ) : null}
        {tab === 'dreams' ? (
          <DreamJournal dreams={dreams} onSave={saveDream} onDelete={deleteDream} />
        ) : null}
        {tab === 'insights' ? (
          <Insights
            sleepEntries={sleepEntries}
            dreams={dreams}
            onClearAll={clearAll}
            onLoadSample={loadSample}
          />
        ) : null}
      </main>

      <footer className="footer">
        <span>Dreammy · your data stays in this browser</span>
        <span className="footer__hint">Built as a starting point — swap localStorage for a backend when you need sync.</span>
      </footer>
    </div>
  )
}
