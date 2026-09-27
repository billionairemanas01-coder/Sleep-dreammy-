import { Card, CardTitle, EmptyState, StatTile } from './ui'
import { MOODS, SLEEP_GOAL_HOURS } from '../lib/moods'
import {
  average,
  formatDuration,
  formatHours,
  fromISO,
  lastNDays,
  sleepMinutes,
} from '../lib/utils'

function Chart({ days, entries }) {
  const byDate = new Map(entries.map((e) => [e.date, e]))
  const values = days.map((d) => {
    const e = byDate.get(d)
    return { day: d, minutes: e ? sleepMinutes(e.bedTime, e.wakeTime) : 0, quality: e?.quality ?? 0 }
  })
  const maxHours = Math.max(SLEEP_GOAL_HOURS + 2, ...values.map((v) => v.minutes / 60))
  const chartH = 150
  const goalY = chartH - (SLEEP_GOAL_HOURS / maxHours) * chartH

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${values.length * 46} ${chartH + 30}`} className="chart__svg" role="img">
        <line
          x1="0"
          x2={values.length * 46}
          y1={goalY}
          y2={goalY}
          className="chart__goal"
        />
        <text x="2" y={goalY - 5} className="chart__goallabel">
          {SLEEP_GOAL_HOURS}h goal
        </text>
        {values.map((v, i) => {
          const hours = v.minutes / 60
          const h = Math.max(2, (hours / maxHours) * chartH)
          const x = i * 46 + 8
          const y = chartH - h
          const hitGoal = hours >= SLEEP_GOAL_HOURS
          return (
            <g key={v.day}>
              <rect
                x={x}
                y={y}
                width="30"
                height={h}
                rx="7"
                className={`chart__bar ${hitGoal ? 'is-goal' : ''} ${v.minutes ? '' : 'is-empty'}`}
              >
                <title>{`${v.day}: ${v.minutes ? formatDuration(v.minutes) : 'not logged'}`}</title>
              </rect>
              {v.minutes ? (
                <text x={x + 15} y={y - 6} className="chart__value">
                  {hours.toFixed(1)}
                </text>
              ) : null}
              <text x={x + 15} y={chartH + 20} className="chart__label">
                {fromISO(v.day).toLocaleDateString(undefined, { day: 'numeric' })}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function Insights({ sleepEntries, dreams, onClearAll, onLoadSample }) {
  const days = lastNDays(14)
  const week = lastNDays(7)
  const weekEntries = sleepEntries.filter((e) => week.includes(e.date))
  const durations = weekEntries.map((e) => sleepMinutes(e.bedTime, e.wakeTime))
  const longest = durations.length ? Math.max(...durations) : 0
  const avgMinutes = average(durations)
  const avgQuality = average(weekEntries.map((e) => e.quality))
  const avgBed = average(
    weekEntries.map((e) => {
      const [h, m] = e.bedTime.split(':').map(Number)
      return (h < 12 ? h + 24 : h) * 60 + m
    }),
  )
  const debt = durations.reduce((sum, d) => sum + Math.max(0, SLEEP_GOAL_HOURS * 60 - d), 0)

  const weekDreams = dreams.filter((d) => week.includes(d.date))
  const moodCounts = MOODS.map((m) => ({
    ...m,
    count: dreams.filter((d) => d.mood === m.id).length,
  })).filter((m) => m.count > 0)
  const maxMood = Math.max(1, ...moodCounts.map((m) => m.count))
  const lucidRate = dreams.length ? Math.round((dreams.filter((d) => d.lucid).length / dreams.length) * 100) : 0

  const bedClock = avgBed
    ? `${String(Math.floor(avgBed / 60) % 24).padStart(2, '0')}:${String(Math.round(avgBed % 60)).padStart(2, '0')}`
    : null

  return (
    <div className="stack">
      <Card>
        <CardTitle>Sleep, last 14 nights</CardTitle>
        {sleepEntries.some((e) => days.includes(e.date)) ? (
          <>
            <Chart days={days} entries={sleepEntries} />
            <p className="muted small">
              Bars that clear the goal line are nights of {SLEEP_GOAL_HOURS}h or more. Hover a bar for details.
            </p>
          </>
        ) : (
          <EmptyState emoji="📈" title="Not enough data yet">
            Log a couple of nights and your trend shows up here.
          </EmptyState>
        )}
      </Card>

      <div className="tiles">
        <StatTile
          label="Longest night"
          value={longest ? formatDuration(longest) : '—'}
          hint="This week"
          accent="#a78bfa"
        />
        <StatTile
          label="Average quality"
          value={weekEntries.length ? avgQuality.toFixed(1) : '—'}
          hint={`${weekEntries.length} of 7 nights logged`}
          accent="#5eead4"
        />
        <StatTile
          label="Typical bedtime"
          value={bedClock ?? '—'}
          hint="Average over 7 nights"
          accent="#60a5fa"
        />
        <StatTile
          label="Sleep debt"
          value={`${formatHours(debt)}h`}
          hint={avgMinutes >= SLEEP_GOAL_HOURS * 60 ? 'Ahead of goal' : 'Behind 8h goal'}
          accent="#fbbf24"
        />
      </div>

      <Card>
        <CardTitle>Dream moods</CardTitle>
        {moodCounts.length ? (
          <>
            <ul className="moodbars">
              {moodCounts.map((m) => (
                <li key={m.id} className="moodbars__row">
                  <span className="moodbars__label">
                    {m.emoji} {m.label}
                  </span>
                  <span className="moodbars__track">
                    <span
                      className="moodbars__fill"
                      style={{ width: `${(m.count / maxMood) * 100}%`, background: m.color }}
                    />
                  </span>
                  <span className="moodbars__count">{m.count}</span>
                </li>
              ))}
            </ul>
            <p className="muted small">
              {dreams.length} dreams recorded · {lucidRate}% lucid · {weekDreams.length} this week
            </p>
          </>
        ) : (
          <EmptyState emoji="💭" title="No dreams recorded yet">
            Moods you tag in the journal are summarised here.
          </EmptyState>
        )}
      </Card>

      <Card>
        <CardTitle>Data</CardTitle>
        <p className="muted small">
          Everything lives in this browser&apos;s local storage — nothing is uploaded. Currently{' '}
          {sleepEntries.length} nights and {dreams.length} dreams.
        </p>
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onLoadSample}>
            Reload sample data
          </button>
          <button type="button" className="btn btn--danger" onClick={onClearAll}>
            Clear everything
          </button>
        </div>
      </Card>
    </div>
  )
}
