// R3-747 — sweep routes for landing-page.
// Built from routeSpace's sections and from corpusIndex.json (emitted by
// scripts/check-corpora.mjs) through routePath. Covers every section root and
// the first entry of each corpus group.

import { SECTIONS, routePath } from "./routeSpace";
import corpusIndexJson from "../data/corpusIndex.json" with { type: "json" };

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

  // Sorted by frontmatter order so the first entry in declared order is selected
  const docsEntries = corpusIndexJson
    .filter((e) => e.path.startsWith("docs/"))
    .sort(
      (a, b) =>
        Number(a.frontmatter.order ?? 0) - Number(b.frontmatter.order ?? 0),
    );

  const seenDocsGroups = new Set<string>();
  for (const e of docsEntries) {
    const group =
      (e.frontmatter.group as string) ||
      (e.slug.includes("--") ? e.slug.split("--")[0] : "default");
    if (!seenDocsGroups.has(group)) {
      seenDocsGroups.add(group);
      const rest = e.slug.includes("--") ? e.slug.split("--") : [e.slug];
      addRoute(routePath({ section: "docs", rest }), `docs:${group}`);
    }
  }

  const tutEntries = corpusIndexJson
    .filter((e) => e.path.startsWith("tutorials/"))
    .sort(
      (a, b) =>
        Number(a.frontmatter.order ?? 0) - Number(b.frontmatter.order ?? 0),
    );

  const seenTutGroups = new Set<string>();
  for (const e of tutEntries) {
    const group =
      (e.frontmatter.pillar as string) ||
      (e.frontmatter.group as string) ||
      "default";
    if (!seenTutGroups.has(group)) {
      seenTutGroups.add(group);
      const rest = e.slug.includes("--") ? e.slug.split("--") : [e.slug];
      addRoute(routePath({ section: "tutorials", rest }), `tutorials:${group}`);
    }
  }

  return routes;
}
