export const MOODS = [
  { id: 'peaceful', label: 'Peaceful', emoji: '🌙', color: '#a78bfa' },
  { id: 'joyful', label: 'Joyful', emoji: '☀️', color: '#fbbf24' },
  { id: 'weird', label: 'Weird', emoji: '🌀', color: '#5eead4' },
  { id: 'exciting', label: 'Exciting', emoji: '⚡', color: '#f472b6' },
  { id: 'sad', label: 'Sad', emoji: '🌧️', color: '#60a5fa' },
  { id: 'scary', label: 'Scary', emoji: '👁️', color: '#f87171' },
]

export const moodById = (id) => MOODS.find((m) => m.id === id) || MOODS[0]

export const QUALITY_LABELS = ['', 'Rough', 'Broken', 'Okay', 'Good', 'Deep']

export const SLEEP_GOAL_HOURS = 8
