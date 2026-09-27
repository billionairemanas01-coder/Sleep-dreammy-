import { Card, CardTitle, EmptyState, MoonIcon, StatTile } from './ui'
import { MOODS, SLEEP_GOAL_HOURS, moodById } from '../lib/moods'
import {
  average,
  formatClock,
  formatDuration,
  formatHours,
  greeting,
  lastNDays,
  loggingStreak,
  relativeDay,
  sleepMinutes,
  todayISO,
  weekdayShort,
} from '../lib/utils'

export default function Dashboard({ sleepEntries, dreams, onLogSleep, onGoTo }) {
  const today = todayISO()
  const week = lastNDays(7)
  const byDate = new Map(sleepEntries.map((e) => [e.date, e]))
  const lastNight = byDate.get(today)
  const weekEntries = week.map((d) => byDate.get(d)).filter(Boolean)

  const avgMinutes = average(weekEntries.map((e) => sleepMinutes(e.bedTime, e.wakeTime)))
  const avgQuality = average(weekEntries.map((e) => e.quality))
  const debtMinutes = weekEntries.reduce(
    (sum, e) => sum + Math.max(0, SLEEP_GOAL_HOURS * 60 - sleepMinutes(e.bedTime, e.wakeTime)),
    0,
  )
  const streak = loggingStreak(sleepEntries)
  const weekDreams = dreams.filter((d) => week.includes(d.date))
  const lucidCount = weekDreams.filter((d) => d.lucid).length
  const recentDreams = [...dreams].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3)

  const maxMinutes = Math.max(60, ...weekEntries.map((e) => sleepMinutes(e.bedTime, e.wakeTime)))

  return (
    <div className="stack">
      <Card className="hero">
        <div className="hero__top">
          <div>
            <p className="eyebrow">{greeting()} · {relativeDay(today)}</p>
            <h1 className="hero__title">
              {lastNight ? 'Last night, logged.' : 'How did you sleep?'}
            </h1>
          </div>
          {streak > 1 ? <span className="pill pill--accent">{streak}-night streak</span> : null}
        </div>

        {lastNight ? (
          <div className="hero__grid">
            <div className="hero__big">
              <strong>{formatDuration(sleepMinutes(lastNight.bedTime, lastNight.wakeTime))}</strong>
              <span>
                {formatClock(lastNight.bedTime)} → {formatClock(lastNight.wakeTime)}
              </span>
            </div>
            <div className="hero__meta">
              <span className="muted">Sleep quality</span>
              <span className="quality__row quality__row--static">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={n <= lastNight.quality ? 'quality__moon is-on' : 'quality__moon'}>
                    <MoonIcon filled={n <= lastNight.quality} size={18} />
                  </span>
                ))}
              </span>
              {lastNight.notes ? <p className="hero__notes">“{lastNight.notes}”</p> : null}
            </div>
          </div>
        ) : (
          <div className="hero__empty">
            <p className="muted">
              You have not logged a night for today yet. It takes about ten seconds.
            </p>
            <button type="button" className="btn btn--primary" onClick={onLogSleep}>
              Log last night
            </button>
          </div>
        )}
      </Card>

      <div className="tiles">
        <StatTile
          label="7-night average"
          value={weekEntries.length ? `${formatHours(avgMinutes)}h` : '—'}
          hint={weekEntries.length ? `Goal ${SLEEP_GOAL_HOURS}h` : 'No nights logged yet'}
          accent="#a78bfa"
        />
        <StatTile
          label="Avg quality"
          value={weekEntries.length ? avgQuality.toFixed(1) : '—'}
          hint="Out of 5"
          accent="#5eead4"
        />
        <StatTile
          label="Sleep debt"
          value={`${formatHours(debtMinutes)}h`}
          hint="Shortfall vs 8h goal"
          accent="#fbbf24"
        />
        <StatTile
          label="Dreams this week"
          value={weekDreams.length}
          hint={`${lucidCount} lucid`}
          accent="#f472b6"
        />
      </div>

      <Card>
        <CardTitle>Last 7 nights</CardTitle>
        {weekEntries.length ? (
          <div className="spark">
            {week.map((day) => {
              const entry = byDate.get(day)
              const mins = entry ? sleepMinutes(entry.bedTime, entry.wakeTime) : 0
              const ok = mins >= SLEEP_GOAL_HOURS * 60
              return (
                <div key={day} className="spark__col" title={entry ? formatDuration(mins) : 'Not logged'}>
                  <div className="spark__bar">
                    <div
                      className={`spark__fill ${ok ? 'is-goal' : ''} ${entry ? '' : 'is-empty'}`}
                      style={{ height: `${Math.round((mins / maxMinutes) * 100)}%` }}
                    />
                  </div>
                  <span className="spark__label">{weekdayShort(day)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState emoji="🌙" title="Nothing logged yet">
            Add your first night and this chart fills in automatically.
          </EmptyState>
        )}
      </Card>

      <Card>
        <CardTitle
          action={
            <button type="button" className="btn btn--ghost" onClick={() => onGoTo('dreams')}>
              View journal
            </button>
          }
        >
          Recent dreams
        </CardTitle>
        {recentDreams.length ? (
          <ul className="dreamlist">
            {recentDreams.map((dream) => {
              const mood = moodById(dream.mood)
              return (
                <li key={dream.id} className="dreamlist__item">
                  <span className="dreamlist__mood" style={{ borderColor: mood.color }}>
                    {mood.emoji}
                  </span>
                  <div className="dreamlist__body">
                    <p className="dreamlist__title">
                      {dream.title || 'Untitled dream'}
                      {dream.lucid ? <span className="pill pill--tiny">lucid</span> : null}
                    </p>
                    <p className="dreamlist__text">{dream.body}</p>
                    <p className="dreamlist__meta">
                      {relativeDay(dream.date)} · {mood.label}
                      {dream.tags?.length ? ` · ${dream.tags.join(', ')}` : ''}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState emoji="💭" title="No dreams written down yet">
            <button type="button" className="btn btn--primary" onClick={() => onGoTo('dreams')}>
              Write your first dream
            </button>
          </EmptyState>
        )}
        {recentDreams.length ? (
          <p className="muted small">
            Moods tracked this week:{' '}
            {MOODS.filter((m) => weekDreams.some((d) => d.mood === m.id))
              .map((m) => m.emoji)
              .join(' ') || '—'}
          </p>
        ) : null}
      </Card>
    </div>
  )
}
