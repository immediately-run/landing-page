import { describe, expect, it } from 'vitest';
import { APPS, appsByRepo, TEASER_REPOS } from './apps';

// The curated list on `/` is hand-typed repo keys. It used to be resolved with
// `find(...).filter(Boolean)`, which turns a typo into two tiles where three were
// meant — a silent failure the page cannot report. These cases run the REAL list
// through the resolver, so a mistyped key fails here.

describe('appsByRepo', () => {
  it('resolves the shelf\'s tiles from the real list', () => {
    const apps = appsByRepo(TEASER_REPOS);
    expect(apps).toHaveLength(TEASER_REPOS.length);
    expect(apps.map((a) => a.repo)).toEqual(TEASER_REPOS);
  });

  it('resolves the board app under its repository name, lodestar, as Lodestar', () => {
    // The repository was renamed from `whiteboard`; the record carries the new name so
    // the tile, the omnibox row and the launch URL agree with the repository.
    const [lodestar] = appsByRepo(['lodestar']);
    expect(lodestar.name).toBe('Lodestar');
    expect(TEASER_REPOS).toContain('lodestar');
  });

  it('names each app once — `/` must not show the same app twice', () => {
    expect(new Set(TEASER_REPOS).size).toBe(TEASER_REPOS.length);
  });

  it('THROWS on a repo no record carries, naming the key', () => {
    expect(() => appsByRepo(['lodestar', 'lode-star'])).toThrowError(/lode-star/);
  });

  it('preserves the order asked for, not the order of APPS', () => {
    const [first, second] = [APPS[1].repo, APPS[0].repo];
    expect(appsByRepo([first, second]).map((a) => a.repo)).toEqual([first, second]);
  });

  it('returns an empty list for an empty request', () => {
    expect(appsByRepo([])).toEqual([]);
  });
});
