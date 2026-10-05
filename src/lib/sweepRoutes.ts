// R3-747 — sweep routes for landing-page.
// Built from routeSpace's sections and from corpusEntries('docs') /
// corpusEntries('tutorials') through routePath. Covers every section root and the
// first entry of each corpus group.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTIONS, routePath } from './routeSpace';

export interface SweepRoute {
  path: string;
  label: string;
}

interface CorpusEntryLike {
  path: string;
  slug: string;
  frontmatter: Record<string, unknown>;
}

async function loadCorpusEntries(dir: string): Promise<CorpusEntryLike[]> {
  try {
    const mod = await import('../data/corpusIndex');
    return mod.corpusEntries(dir);
  } catch {
    // In pure Node (e.g. Playwright) where .mdx static imports in corpusIndex cannot load:
    const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const corpusDir = path.join(rootDir, dir);
    if (!fs.existsSync(corpusDir)) return [];
    const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.mdx'));
    return files.map((f) => {
      const slug = f.replace(/\.mdx$/, '');
      const content = fs.readFileSync(path.join(corpusDir, f), 'utf8');
      const groupMatch = content.match(/group:\s*"?([^"\n]+)"?/);
      const pillarMatch = content.match(/pillar:\s*"?([^"\n]+)"?/);
      const orderMatch = content.match(/order:\s*(\d+)/);
      return {
        path: `${dir}/${f}`,
        slug,
        frontmatter: {
          group: groupMatch?.[1]?.trim(),
          pillar: pillarMatch?.[1]?.trim(),
          order: orderMatch ? Number(orderMatch[1]) : 0,
        },
      };
    });
  }
}

function sweepRoutesFromEntries(
  docsEntries: CorpusEntryLike[],
  tutEntries: CorpusEntryLike[],
): SweepRoute[] {
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

  // First entry of each group in docs
  const seenDocsGroups = new Set<string>();
  for (const e of docsEntries) {
    const group = (e.frontmatter.group as string) || (e.slug.includes('--') ? e.slug.split('--')[0] : 'default');
    if (!seenDocsGroups.has(group)) {
      seenDocsGroups.add(group);
      const rest = e.slug.includes('--') ? e.slug.split('--') : [e.slug];
      addRoute(routePath({ section: 'docs', rest }), `docs:${group}`);
    }
  }

  // First entry of each group in tutorials
  const seenTutGroups = new Set<string>();
  for (const e of tutEntries) {
    const group = (e.frontmatter.pillar as string) || (e.frontmatter.group as string) || 'default';
    if (!seenTutGroups.has(group)) {
      seenTutGroups.add(group);
      const rest = e.slug.includes('--') ? e.slug.split('--') : [e.slug];
      addRoute(routePath({ section: 'tutorials', rest }), `tutorials:${group}`);
    }
  }

  return routes;
}

const docsEntries = await loadCorpusEntries('docs');
const tutEntries = await loadCorpusEntries('tutorials');

export function sweepRoutes(): SweepRoute[] {
  return sweepRoutesFromEntries(docsEntries, tutEntries);
}
