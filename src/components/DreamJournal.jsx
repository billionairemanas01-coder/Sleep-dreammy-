import { useMemo, useState } from 'react'
import { Card, CardTitle, EmptyState, MoodPicker } from './ui'
import { MOODS, moodById } from '../lib/moods'
import { formatDate, relativeDay, todayISO } from '../lib/utils'

const blankForm = () => ({
  id: null,
  date: todayISO(),
  title: '',
  body: '',
  mood: 'weird',
  lucid: false,
  tags: [],
})

export default function DreamJournal({ dreams, onSave, onDelete }) {
  const [form, setForm] = useState(blankForm)
  const [tagText, setTagText] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState('all')
  const [lucidOnly, setLucidOnly] = useState(false)

  const editing = Boolean(form.id)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  function submit(event) {
    event.preventDefault()
    if (!form.body.trim()) {
      setError('Write at least a line about the dream.')
      return
    }
    setError('')
    const tags = tagText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    onSave({ ...form, title: form.title.trim(), body: form.body.trim(), tags })
    setForm(blankForm())
    setTagText('')
  }

  function edit(dream) {
    setForm({ ...dream })
    setTagText((dream.tags || []).join(', '))
    setError('')
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      /* scroll APIs are unavailable in some embedded webviews */
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...dreams]
      .filter((d) => (moodFilter === 'all' ? true : d.mood === moodFilter))
      .filter((d) => (lucidOnly ? d.lucid : true))
      .filter((d) => {
        if (!q) return true
        return (
          d.title.toLowerCase().includes(q) ||
          d.body.toLowerCase().includes(q) ||
          (d.tags || []).some((t) => t.includes(q))
        )
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [dreams, query, moodFilter, lucidOnly])

  return (
    <div className="stack">
      <Card>
        <CardTitle>{editing ? 'Edit dream' : 'Catch a dream'}</CardTitle>
        <p className="muted small">
          Trick: keep the phone face down and write the first thing you remember, before the details fade.
        </p>
        <form className="form" onSubmit={submit}>
          <div className="form__row">
            <label className="field field--wide">
              <span>Title</span>
              <input
                type="text"
                placeholder="A one-line name for it"
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Night of</span>
              <input
                type="date"
                value={form.date}
                max={todayISO()}
                onChange={(e) => set({ date: e.target.value })}
              />
            </label>
          </div>

          <div className="field">
            <span>What did it feel like?</span>
            <MoodPicker value={form.mood} onChange={(m) => set({ mood: m })} />
          </div>

          <label className="field">
            <span>The dream</span>
            <textarea
              rows="5"
              placeholder="Where were you, who was there, what happened…"
              value={form.body}
              onChange={(e) => set({ body: e.target.value })}
            />
          </label>

          <div className="form__row">
            <label className="field">
              <span>Tags (comma separated)</span>
              <input
                type="text"
                placeholder="flying, water, recurring"
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
              />
            </label>
            <label className="field field--check">
              <input
                type="checkbox"
                checked={form.lucid}
                onChange={(e) => set({ lucid: e.target.checked })}
              />
              <span>I knew I was dreaming (lucid)</span>
            </label>
          </div>

          {error ? <p className="error">{error}</p> : null}

          <div className="form__actions">
            <button type="submit" className="btn btn--primary">
              {editing ? 'Save changes' : 'Save dream'}
            </button>
            {editing ? (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setForm(blankForm())
                  setTagText('')
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle
          action={<span className="muted small">{filtered.length} shown</span>}
        >
          Dream journal
        </CardTitle>

        <div className="filters">
          <input
            type="search"
            className="filters__search"
            placeholder="Search dreams, tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)}>
            <option value="all">All moods</option>
            {MOODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`btn btn--ghost btn--sm ${lucidOnly ? 'is-active' : ''}`}
            onClick={() => setLucidOnly((v) => !v)}
          >
            {lucidOnly ? '✨ Lucid only' : '✨ All dreams'}
          </button>
        </div>

        {filtered.length ? (
          <ul className="dreamgrid">
            {filtered.map((dream) => {
              const mood = moodById(dream.mood)
              return (
                <li key={dream.id} className="dreamcard" style={{ '--mood': mood.color }}>
                  <div className="dreamcard__top">
                    <span className="dreamcard__mood">
                      {mood.emoji} {mood.label}
                    </span>
                    <span className="dreamcard__date">{relativeDay(dream.date)}</span>
                  </div>
                  <h3 className="dreamcard__title">{dream.title || 'Untitled dream'}</h3>
                  <p className="dreamcard__body">{dream.body}</p>
                  {dream.lucid || dream.tags?.length ? (
                    <div className="dreamcard__tags">
                      {dream.lucid ? <span className="tag tag--lucid">✨ lucid</span> : null}
                      {(dream.tags || []).map((tag) => (
                        <span key={tag} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="dreamcard__foot">
                    <span className="muted small">{formatDate(dream.date)}</span>
                    <div className="dreamcard__btns">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => edit(dream)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => onDelete(dream.id)}
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
          <EmptyState emoji="💭" title="Nothing here matches">
            Try clearing the search or write a new dream above.
          </EmptyState>
        )}
      </Card>
    </div>
  )
}
