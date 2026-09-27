import { createRoot } from 'react-dom/client'
import App from '../src/App.jsx'
export function mount(el) {
  const root = createRoot(el)
  root.render(<App />)
  return root
}
