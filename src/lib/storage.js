import { useEffect, useState } from 'react'

/** State that transparently persists to localStorage. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const fallback = () => (typeof initialValue === 'function' ? initialValue() : initialValue)
    try {
      const raw = window.localStorage.getItem(key)
      if (raw == null) return fallback()
      const parsed = JSON.parse(raw)
      return parsed == null ? fallback() : parsed
    } catch {
      return fallback()
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or unavailable — the app still works in-memory */
    }
  }, [key, value])

  return [value, setValue]
}
