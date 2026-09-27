import { lastNDays, uid } from './utils'

// A realistic week of data so the app has something to show on first run.
const SLEEP_SEED = [
  { bed: '23:45', wake: '06:50', quality: 3, notes: 'Phone kept me up longer than planned.' },
  { bed: '23:10', wake: '07:20', quality: 5, notes: 'No screens an hour before bed — worked.' },
  { bed: '00:30', wake: '07:05', quality: 2, notes: 'Late film night, groggy morning.' },
  { bed: '22:55', wake: '06:40', quality: 4, notes: 'Read a chapter before sleeping.' },
  { bed: '23:35', wake: '07:30', quality: 4, notes: 'Woke once around 3am.' },
  { bed: '00:10', wake: '06:55', quality: 3, notes: 'Busy head, took a while to drift off.' },
  { bed: '23:05', wake: '07:15', quality: 5, notes: 'Rain outside, slept like a stone.' },
]

const DREAM_SEED = [
  {
    daysAgo: 0,
    title: 'The train that flew',
    body: 'I boarded an old steam train, but somewhere past the third stop it simply lifted off the tracks and cruised over a city made of glass. Nobody else on board found it strange.',
    mood: 'weird',
    lucid: false,
    tags: ['flying', 'city'],
  },
  {
    daysAgo: 1,
    title: 'Kitchen of my childhood',
    body: 'I was six again, watching my grandmother make tea. She hummed a song I have not heard in twenty years. I woke up smiling and oddly calm.',
    mood: 'peaceful',
    lucid: false,
    tags: ['family', 'memory'],
  },
  {
    daysAgo: 3,
    title: 'Lucid by the harbour',
    body: 'I realised I was dreaming when the water refused to ripple. I flew low over the boats, and for once I remembered to look at my hands.',
    mood: 'exciting',
    lucid: true,
    tags: ['lucid', 'flying', 'water'],
  },
  {
    daysAgo: 4,
    title: 'Endless library',
    body: 'Every book I opened had my own handwriting in it. I kept looking for the last shelf and never found it.',
    mood: 'weird',
    lucid: false,
    tags: ['books', 'recurring'],
  },
  {
    daysAgo: 6,
    title: 'Missing the last bus',
    body: 'A grey street, an empty stop, and the feeling that everyone else had somewhere to be. Woke up with a tight chest.',
    mood: 'sad',
    lucid: false,
    tags: ['anxiety'],
  },
]

export function seedSleepEntries() {
  const days = lastNDays(SLEEP_SEED.length)
  return days.map((date, i) => ({
    id: uid(),
    date,
    bedTime: SLEEP_SEED[i].bed,
    wakeTime: SLEEP_SEED[i].wake,
    quality: SLEEP_SEED[i].quality,
    notes: SLEEP_SEED[i].notes,
  }))
}

export function seedDreams() {
  const days = lastNDays(7)
  return DREAM_SEED.map((d) => ({
    id: uid(),
    date: days[days.length - 1 - d.daysAgo],
    title: d.title,
    body: d.body,
    mood: d.mood,
    lucid: d.lucid,
    tags: d.tags,
  }))
}
