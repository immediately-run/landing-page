import { useEffect, useState } from 'react';

export type Section = 'home' | 'showcase' | 'apps' | 'docs' | 'tutorials' | 'changelog';

export interface Route {
  section: Section;
  /** Path segments after the section, e.g. /docs/agents/llms → ['agents','llms']. */
  rest: string[];
}

const SECTIONS: Section[] = ['home', 'showcase', 'apps', 'docs', 'tutorials', 'changelog'];

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const segs = raw.split('/').filter(Boolean);
  const first = segs[0] ?? '';
  if (first === '' ) return { section: 'home', rest: [] };
  const section = (SECTIONS as string[]).includes(first) ? (first as Section) : 'home';
  return { section, rest: segs.slice(1) };
}

// Hash-based router so the whole federated-looking site lives in one app and
// works without a server (immediately.run serves a single entry). Sections swap
// on hashchange; we scroll to top when the section itself changes.
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHash = () => {
      const next = parseHash();
      setRoute((prev) => {
        if (prev.section !== next.section) window.scrollTo({ top: 0 });
        return next;
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route;
}
