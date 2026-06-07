import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'immediately-run-theme';

// Accessing window.localStorage throws a SecurityError inside a sandboxed
// iframe without the `allow-same-origin` flag (e.g. when the site is rendered
// by the /present Sandpack preview), so every touch must be guarded.
function safeStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (sandboxed iframe / privacy mode) — theme just
    // won't persist across reloads.
  }
}

function readInitialTheme(): Theme {
  return safeStorageGet(STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

// Persists the colour theme to localStorage and reflects it on <html> as a
// `data-theme` attribute, matching the CSS in index.css. `dark` is represented
// by the absence of the attribute.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    safeStorageSet(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggle };
}
