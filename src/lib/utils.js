const pad = (n) => String(n).padStart(2, '0')

export function todayISO(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromISO(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function addDays(iso, n) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return todayISO(d)
}

export function lastNDays(n, endISO = todayISO()) {
  const out = []
  for (let i = n - 1; i >= 0; i -= 1) out.push(addDays(endISO, -i))
  return out
}

export function toMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = String(hhmm).split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

/** Length of a sleep session in minutes; a wake time "before" bedtime wraps past midnight. */
export function sleepMinutes(bed, wake) {
  const b = toMinutes(bed)
  const w = toMinutes(wake)
  if (b == null || w == null) return 0
  let diff = w - b
  if (diff <= 0) diff += 24 * 60
  return diff
}

export function formatDuration(mins) {
  const total = Math.max(0, Math.round(mins))
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}h ${pad(m)}m`
}

export function formatHours(mins) {
  return (mins / 60).toFixed(1)
}

export function formatClock(hhmm) {
  const t = toMinutes(hhmm)
  if (t == null) return '—'
  let h = Math.floor(t / 60)
  const m = t % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${pad(m)} ${ap}`
}

export function formatDate(iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return fromISO(iso).toLocaleDateString(undefined, opts)
}

export function relativeDay(iso) {
  const t = todayISO()
  if (iso === t) return 'Today'
  if (iso === addDays(t, -1)) return 'Yesterday'
  return formatDate(iso)
}

export function weekdayShort(iso) {
  return fromISO(iso).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)
}

export function greeting(d = new Date()) {
  const h = d.getHours()
  if (h < 5) return 'Still up?'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 22) return 'Good evening'
  return 'Time to wind down'
}

export function average(nums) {
  const clean = nums.filter((n) => Number.isFinite(n))
  if (!clean.length) return 0
  return clean.reduce((a, b) => a + b, 0) / clean.length
}

/** Streak of consecutive days (ending today or yesterday) with a logged night. */
export function loggingStreak(entries) {
  const days = new Set(entries.map((e) => e.date))
  const today = todayISO()
  let cursor = days.has(today) ? today : addDays(today, -1)
  if (!days.has(cursor)) return 0
  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}
