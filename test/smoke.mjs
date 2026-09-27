/**
 * Smoke test: renders the real app in jsdom and exercises the main flows
 * (log a night, edit it, delete it, write a dream, search, insights).
 *
 *   npm run smoke
 */
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { JSDOM } from 'jsdom'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { rm } from 'node:fs/promises'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '.bundle')

/* ---------- harness ---------- */
let failed = 0
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : ' ' + extra}`)
  if (!ok) failed += 1
}

/* ---------- bundle the app for the test environment ---------- */
await build({
  configFile: false,
  root: here,
  logLevel: 'error',
  plugins: [react()],
  build: {
    outDir,
    emptyOutDir: true,
    minify: false,
    lib: { entry: join(here, 'entry.jsx'), formats: ['es'], fileName: 'app' },
    rollupOptions: { external: [] },
  },
})

/* ---------- browser-ish globals ---------- */
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
})
const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
globalThis.HTMLElement = window.HTMLElement
globalThis.Node = window.Node
globalThis.localStorage = window.localStorage
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
window.confirm = () => true
window.scrollTo = () => {}

const appErrors = []
console.error = (...args) => {
  const msg = args.join(' ')
  // act() advisories are a harness artifact, not an app problem
  if (!msg.includes('act(')) appErrors.push(msg)
}
window.addEventListener('error', (e) => appErrors.push(String(e.error || e.message)))

/* ---------- helpers ---------- */
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
const setValue = (el, value) => {
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement : window.HTMLInputElement
  Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, value)
  el.dispatchEvent(new window.Event('input', { bubbles: true }))
  el.dispatchEvent(new window.Event('change', { bubbles: true }))
}
const submit = (form) => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
const byText = (selector, text) => [...document.querySelectorAll(selector)].find((el) => el.textContent === text)
const buttonIn = (root, text) => [...root.querySelectorAll('button')].find((b) => b.textContent === text)
const storage = (key) => JSON.parse(localStorage.getItem(key) || '[]')
const nights = () => storage('dreammy.sleep.v1')
const dreams = () => storage('dreammy.dreams.v1')

async function goToTab(label) {
  click([...document.querySelectorAll('.tab')].find((t) => t.textContent.includes(label)))
  await wait()
}

/* ---------- run ---------- */
const { mount } = await import(join(outDir, 'app.js'))
mount(document.getElementById('root'))
await wait(400)

// first run seeds a sample week
check('seeds sample nights', nights().length === 7, `(${nights().length})`)
check('seeds sample dreams', dreams().length === 5, `(${dreams().length})`)
check('dashboard renders', document.body.textContent.includes('Dreammy'))

// log a night
await goToTab('Sleep log')
const before = nights().length
const form = document.querySelector('form')
const [, bed, wake] = form.querySelectorAll('input[type="date"], input[type="time"]')
setValue(bed, '22:30')
setValue(wake, '06:30')
setValue(form.querySelector('textarea'), 'Test night: slept straight through.')
click(form.querySelectorAll('button.quality__moon')[4])
await wait(60)
submit(form)
await wait(300)
check('saves a night', nights().length === before + 1, `(${nights().length})`)
const saved = nights().at(-1)
check('stores times, quality, notes',
  saved.bedTime === '22:30' && saved.wakeTime === '06:30' && saved.quality === 5 && /Test night/.test(saved.notes))
check('new night gets an id', typeof saved.id === 'string' && saved.id.length > 3)
check('ids are unique', new Set(nights().map((e) => e.id)).size === nights().length)
check('duration preview correct', document.body.textContent.includes('8h 00m'))

// edit it
const row = [...document.querySelectorAll('.history__item')].find((li) => li.textContent.includes('Test night'))
click(buttonIn(row, 'Edit'))
await wait(300)
check('edit prefills the form', document.querySelector('input[type="time"]').value === '22:30')
check('edit mode is labelled', document.querySelector('.card__title').textContent === 'Edit night')
const editForm = document.querySelector('form')
setValue(editForm.querySelectorAll('input[type="time"]')[1], '07:15')
await wait(60)
submit(editForm)
await wait(300)
const edited = nights().find((e) => e.id === saved.id)
check('edit updates in place', edited?.wakeTime === '07:15' && nights().length === before + 1)
check('form resets after save', document.querySelector('.card__title').textContent === 'Log a night')

// delete a night
const row2 = [...document.querySelectorAll('.history__item')].find((li) => li.textContent.includes('Test night'))
click(buttonIn(row2, 'Delete'))
await wait(300)
check('deletes only that night', nights().length === before && !nights().some((e) => e.id === saved.id))

// write a dream
await goToTab('Dreams')
const dreamCount = dreams().length
const dreamForm = document.querySelector('form')
const textInputs = dreamForm.querySelectorAll('input[type="text"]')
setValue(textInputs[0], 'Bicycle made of clouds')
setValue(dreamForm.querySelector('textarea'), 'I rode a bicycle made of clouds over a green valley.')
setValue(textInputs[1], 'clouds, flying')
click(dreamForm.querySelectorAll('.chip')[2])
click(dreamForm.querySelector('input[type="checkbox"]'))
await wait(60)
submit(dreamForm)
await wait(300)
check('saves a dream', dreams().length === dreamCount + 1, `(${dreams().length})`)
const dream = dreams().at(-1)
check('stores title, mood, lucid flag, tags',
  dream.title === 'Bicycle made of clouds' && dream.mood === 'weird' && dream.lucid === true &&
  dream.tags.join(',') === 'clouds,flying')
check('rejects an empty dream', (() => {
  submit(document.querySelector('form'))
  return true
})())
await wait(200)
check('shows validation message', document.body.textContent.includes('Write at least a line'))

// search / filters
setValue(document.querySelector('.filters__search'), 'bicycle')
await wait(200)
check('search filters the journal',
  document.body.textContent.includes('Bicycle made of clouds') &&
  !document.body.textContent.includes('Endless library'))
setValue(document.querySelector('.filters__search'), 'zzz-no-match')
await wait(200)
check('empty state for no matches', document.body.textContent.includes('Nothing here matches'))

// insights
await goToTab('Insights')
check('renders the 14-night chart', !!document.querySelector('.chart__svg'))
check('renders summary stats', document.body.textContent.includes('Sleep debt'))

// data survives a reload (fresh mount over the same storage)
document.getElementById('root').innerHTML = ''
mount(document.getElementById('root'))
await wait(400)
check('data persists across reload', nights().length === 7 && document.body.textContent.includes('Dreammy'))

check('no unexpected console errors', appErrors.length === 0, appErrors.slice(0, 3).join(' | '))

await rm(outDir, { recursive: true, force: true })
console.log(failed ? `\n${failed} check(s) failed` : '\nAll smoke checks passed')
process.exit(failed ? 1 : 0)
