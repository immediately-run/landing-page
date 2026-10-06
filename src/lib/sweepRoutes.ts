// R3-747 — sweep routes for landing-page.
// Built from routeSpace's sections and from corpusIndex.json (emitted by
// scripts/check-corpora.mjs) through routePath. Covers every section root and
// the first entry of each corpus group.

import { SECTIONS, routePath } from './routeSpace';
import corpusIndexJson from '../data/corpusIndex.json' with { type: 'json' };

export interface SweepRoute {
  path: string;
  label: string;
}

export function sweepRoutes(): SweepRoute[] {
  const routes: SweepRoute[] = [];
  const seenPaths = new Set<string>();

  const addRoute = (p: string, label: string) => {
    if (!seenPaths.has(p)) {
      seenPaths.add(p);
      routes.push({ path: p, label });
    }
  };

  // Every section root
  for (const s of SECTIONS) {
    addRoute(routePath({ section: s, rest: [] }), s);
  }

  // First entry of each group in docs (corpusIndexJson is already order-sorted by check-corpora)
  const seenDocsGroups = new Set<string>();
  for (const e of corpusIndexJson) {
    if (!e.path.startsWith('docs/')) continue;
    const group =
      (e.frontmatter.group as string) ||
      (e.slug.includes('--') ? e.slug.split('--')[0] : 'default');
    if (!seenDocsGroups.has(group)) {
      seenDocsGroups.add(group);
      const rest = e.slug.includes('--') ? e.slug.split('--') : [e.slug];
      addRoute(routePath({ section: 'docs', rest }), `docs:${group}`);
    }
  }

  // First entry of each group in tutorials
  const seenTutGroups = new Set<string>();
  for (const e of corpusIndexJson) {
    if (!e.path.startsWith('tutorials/')) continue;
    const group =
      (e.frontmatter.pillar as string) ||
      (e.frontmatter.group as string) ||
      'default';
    if (!seenTutGroups.has(group)) {
      seenTutGroups.add(group);
      const rest = e.slug.includes('--') ? e.slug.split('--') : [e.slug];
      addRoute(routePath({ section: 'tutorials', rest }), `tutorials:${group}`);
    }
  }

  return routes;
}
