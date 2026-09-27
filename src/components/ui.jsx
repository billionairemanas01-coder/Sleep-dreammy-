import { MOODS, QUALITY_LABELS } from '../lib/moods'

export function Card({ children, className = '', ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {children}
    </section>
  )
}

export function CardTitle({ children, action }) {
  return (
    <div className="card__head">
      <h2 className="card__title">{children}</h2>
      {action}
    </div>
  )
}

export function StatTile({ label, value, hint, accent }) {
  return (
    <div className="tile">
      <span className="tile__label">{label}</span>
      <strong className="tile__value" style={accent ? { color: accent } : undefined}>
        {value}
      </strong>
      {hint ? <span className="tile__hint">{hint}</span> : null}
    </div>
  )
}

export function MoonIcon({ filled = true, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.6 14.2A8.4 8.4 0 0 1 9.8 3.4a8.6 8.6 0 1 0 10.8 10.8z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function QualityPicker({ value, onChange }) {
  return (
    <div className="quality">
      <div className="quality__row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`quality__moon ${n <= value ? 'is-on' : ''}`}
            onClick={() => onChange(n)}
            aria-label={`Sleep quality ${n} of 5`}
            title={QUALITY_LABELS[n]}
          >
            <MoonIcon filled={n <= value} size={20} />
          </button>
        ))}
      </div>
      <span className="quality__label">{QUALITY_LABELS[value] || 'Not rated'}</span>
    </div>
  )
}

export function MoodPicker({ value, onChange }) {
  return (
    <div className="chips">
      {MOODS.map((mood) => (
        <button
          key={mood.id}
          type="button"
          className={`chip ${value === mood.id ? 'is-on' : ''}`}
          style={value === mood.id ? { borderColor: mood.color, color: mood.color } : undefined}
          onClick={() => onChange(mood.id)}
        >
          <span aria-hidden="true">{mood.emoji}</span> {mood.label}
        </button>
      ))}
    </div>
  )
}

export function Stars({ value }) {
  if (!value) return <span className="muted">Not rated</span>
  return (
    <span className="stars" title={QUALITY_LABELS[value]}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'stars__on' : 'stars__off'}>
          ●
        </span>
      ))}
    </span>
  )
}

export function EmptyState({ emoji = '🌙', title, children }) {
  return (
    <div className="empty">
      <span className="empty__emoji" aria-hidden="true">
        {emoji}
      </span>
      <p className="empty__title">{title}</p>
      {children ? <p className="empty__text">{children}</p> : null}
    </div>
  )
}
