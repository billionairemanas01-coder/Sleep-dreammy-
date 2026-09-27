import { useState } from 'react'
import { Card, CardTitle, EmptyState, QualityPicker, Stars } from './ui'
import {
  formatClock,
  formatDate,
  formatDuration,
  relativeDay,
  sleepMinutes,
  todayISO,
} from '../lib/utils'

const blankForm = () => ({
  id: null,
  date: todayISO(),
  bedTime: '23:00',
  wakeTime: '07:00',
  quality: 4,
  notes: '',
})

export default function SleepTracker({ entries, onSave, onDelete }) {
  const [form, setForm] = useState(blankForm)
  const [error, setError] = useState('')
  const editing = Boolean(form.id)
  const preview = sleepMinutes(form.bedTime, form.wakeTime)
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1))

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  function submit(event) {
    event.preventDefault()
    if (!form.bedTime || !form.wakeTime) {
      setError('Bedtime and wake time are both required.')
      return
    }
    if (preview < 30) {
      setError('That works out to under 30 minutes — double-check the times.')
      return
    }
    setError('')
    onSave({ ...form, quality: Number(form.quality) || 3 })
    setForm(blankForm())
  }

  function edit(entry) {
    setForm({ ...entry })
    setError('')
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      /* scroll APIs are unavailable in some embedded webviews */
    }
  }

  return (
    <div className="stack">
      <Card>
        <CardTitle>{editing ? 'Edit night' : 'Log a night'}</CardTitle>
        <form className="form" onSubmit={submit}>
          <div className="form__row">
            <label className="field">
              <span>Woke up on</span>
              <input
                type="date"
                value={form.date}
                max={todayISO()}
                onChange={(e) => set({ date: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Bedtime</span>
              <input
                type="time"
                value={form.bedTime}
                onChange={(e) => set({ bedTime: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Wake up</span>
              <input
                type="time"
                value={form.wakeTime}
                onChange={(e) => set({ wakeTime: e.target.value })}
              />
            </label>
          </div>

          <div className="form__row form__row--split">
            <div className="field">
              <span>Sleep quality</span>
              <QualityPicker value={form.quality} onChange={(q) => set({ quality: q })} />
            </div>
            <div className="field field--preview">
              <span>Time asleep</span>
              <strong className="preview">{formatDuration(preview)}</strong>
              <span className="muted small">
                {formatClock(form.bedTime)} → {formatClock(form.wakeTime)}
              </span>
            </div>
          </div>

          <label className="field">
            <span>Notes</span>
            <textarea
              rows="3"
              placeholder="Woke up twice, room was too warm, felt rested…"
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
            />
          </label>

          {error ? <p className="error">{error}</p> : null}

          <div className="form__actions">
            <button type="submit" className="btn btn--primary">
              {editing ? 'Save changes' : 'Save night'}
            </button>
            {editing ? (
              <button type="button" className="btn btn--ghost" onClick={() => setForm(blankForm())}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle>Sleep history</CardTitle>
        {sorted.length ? (
          <ul className="history">
            {sorted.map((entry) => {
              const mins = sleepMinutes(entry.bedTime, entry.wakeTime)
              return (
                <li key={entry.id} className="history__item">
                  <div className="history__main">
                    <p className="history__date">
                      {relativeDay(entry.date)}
                      <span className="muted small"> · {formatDate(entry.date)}</span>
                    </p>
                    <p className="history__times">
                      {formatClock(entry.bedTime)} → {formatClock(entry.wakeTime)} ·{' '}
                      <Stars value={entry.quality} />
                    </p>
                    {entry.notes ? <p className="history__notes">{entry.notes}</p> : null}
                  </div>
                  <div className="history__side">
                    <strong className="history__dur">{formatDuration(mins)}</strong>
                    <div className="history__btns">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => edit(entry)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => onDelete(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState emoji="🛏️" title="No nights logged yet">
            Fill in the form above and your history will appear here.
          </EmptyState>
        )}
      </Card>
    </div>
  )
}
