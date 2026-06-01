import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Local-dev / production entry point. immediately.run does NOT use this file —
// it renders the default export of src/App.tsx directly. Keep anything the
// rendered app needs (global CSS imports, providers) inside App.tsx, not here.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
