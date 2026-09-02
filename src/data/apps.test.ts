import { describe, expect, it } from 'vitest';
import { APPS, appsByRepo, RUN_TILE_REPOS, TEASER_REPOS } from './apps';

// The two curated lists on `/` are hand-typed repo keys. They used to be resolved
// with `find(...).filter(Boolean)`, which turns a typo into three tiles where four
// were meant — a silent failure the page cannot report. These cases run the REAL
// lists through the resolver, so a mistyped key fails here.

describe('appsByRepo', () => {
  it('resolves the Run section\'s four tiles from the real list', () => {
    const apps = appsByRepo(RUN_TILE_REPOS);
    expect(apps).toHaveLength(RUN_TILE_REPOS.length);
    expect(apps.map((a) => a.repo)).toEqual(RUN_TILE_REPOS);
  });

  it('resolves the directory teaser\'s four tiles from the real list', () => {
    const apps = appsByRepo(TEASER_REPOS);
    expect(apps).toHaveLength(TEASER_REPOS.length);
    expect(apps.map((a) => a.repo)).toEqual(TEASER_REPOS);
  });

  it('keeps the two selections disjoint — `/` must not show the same app twice', () => {
    expect(RUN_TILE_REPOS.filter((r) => TEASER_REPOS.includes(r))).toEqual([]);
  });

  it('THROWS on a repo no record carries, naming the key', () => {
    expect(() => appsByRepo(['whiteboard', 'white-board'])).toThrowError(/white-board/);
  });

  it('preserves the order asked for, not the order of APPS', () => {
    const [first, second] = [APPS[1].repo, APPS[0].repo];
    expect(appsByRepo([first, second]).map((a) => a.repo)).toEqual([first, second]);
  });

  it('returns an empty list for an empty request', () => {
    expect(appsByRepo([])).toEqual([]);
  });
});
