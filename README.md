# Dreammy 🌙

A sleep tracker and dream journal. Log how you slept, write down what you dreamed,
and see the patterns in both.

![dreamy night sky UI](https://img.shields.io/badge/theme-night%20sky-6d5cf0)

## Features

- **Tonight** — one-glance dashboard: last night's duration and quality, 7-night
  average, sleep debt vs an 8h goal, logging streak, recent dreams, and a 7-night bar chart.
- **Sleep log** — log bedtime, wake time, a 1–5 moon-quality rating and notes; live
  duration preview; edit or delete any night; full history list.
- **Dreams** — title, the dream itself, a mood tag, free-form tags and a "lucid" flag;
  search across text and tags, and filter by mood or lucidity.
- **Insights** — a 14-night bar chart with a goal line, longest night, typical bedtime,
  sleep debt, and a breakdown of dream moods with the share of lucid dreams.
- **Local-first** — everything is stored in the browser's `localStorage`; nothing is uploaded.
  Clear or reload the sample week from the Insights tab.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build
npm run smoke     # render the app in jsdom and exercise the main flows
```

The dev server binds to `0.0.0.0` and accepts any host header, so it also works
behind a proxy/port-forwarded preview.

## Project layout

```
index.html
src/
  main.jsx              # entry point
  App.jsx               # tab shell, state and persistence
  styles.css            # dark "night sky" theme
  lib/
    utils.js            # date/time maths, formatting, streaks
    storage.js          # useLocalStorage hook
    moods.js            # mood + sleep-quality definitions
    sampleData.js       # a week of demo nights and dreams
  components/
    Dashboard.jsx       # "Tonight" overview
    SleepTracker.jsx    # log + edit nights
    DreamJournal.jsx    # write, search and filter dreams
    Insights.jsx        # charts and stats
test/
  smoke.mjs             # jsdom smoke test used by `npm run smoke`
```

## Notes on the sleep maths

A night is stored as the date you **woke up** plus `bedTime`/`wakeTime`.
Duration wraps past midnight, so `23:30 → 07:00` is 7h 30m. Quality is 1–5 moons.
"Sleep debt" is the total shortfall against an 8-hour goal for the period shown.

## Ideas for next steps

- Swap `localStorage` for a backend (e.g. Supabase/SQLite) to sync across devices.
- Reminders: a wind-down nudge and a "before you forget the dream" morning prompt.
- Recurring-symbol analysis across dreams, plus weekly email/markdown export.
- PWA support for offline logging from the bedside.
