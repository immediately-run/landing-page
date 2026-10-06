// R3-747 — sweepRoutes unit tests:
//   1. Every section in SECTIONS is present;
//   2. One entry per corpus group in docs and tutorials;
//   3. All paths round-trip through parseRoute.

import { describe, expect, it } from 'vitest';
import { SECTIONS, parseRoute, routePath } from './routeSpace';
import { corpusEntries } from '../data/corpusIndex';
import { sweepRoutes } from './sweepRoutes';

describe('sweepRoutes (R3-747)', () => {
  it('every section routeSpace knows is present', () => {
    const routes = sweepRoutes();
    const paths = new Set(routes.map((r) => r.path));

    for (const s of SECTIONS) {
      expect(paths).toContain(routePath({ section: s, rest: [] }));
    }
  });

  it('has one entry per corpus group in docs', () => {
    const routes = sweepRoutes();
    const docsEntries = corpusEntries('docs');
    const docsGroups = new Set<string>();

    for (const e of docsEntries) {
      const group = (e.frontmatter.group as string) || (e.slug.includes('--') ? e.slug.split('--')[0] : 'default');
      docsGroups.add(group);
    }

    const docsRoutes = routes.filter((r) => r.path.startsWith('/docs/'));
    expect(docsRoutes.length).toBe(docsGroups.size);
  });

  it('has one entry per corpus group in tutorials', () => {
    const routes = sweepRoutes();
    const tutEntries = corpusEntries('tutorials');
    const tutGroups = new Set<string>();

    for (const e of tutEntries) {
      const group = (e.frontmatter.pillar as string) || (e.frontmatter.group as string) || 'default';
      tutGroups.add(group);
    }

    const tutRoutes = routes.filter((r) => r.path.startsWith('/tutorials/'));
    expect(tutRoutes.length).toBe(tutGroups.size);
  });

  it('every path round-trips through parseRoute', () => {
    const routes = sweepRoutes();
    for (const r of routes) {
      expect(routePath(parseRoute(r.path))).toBe(r.path);
    }
  });
});
