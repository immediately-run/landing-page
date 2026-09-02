import { describe, expect, it } from 'vitest';
import {
  appPathFromSandboxPath,
  redirectForPath,
  legacyHashPath,
  parseRoute,
  routePath,
} from './routeSpace';

// The route space is the one part of retiring the hash router that is pure, and it is also
// the part where a mistake is invisible: a wrong parse renders the homepage instead of an
// error, so nothing looks broken — the reader just does not arrive.

describe('redirectForPath (R3-513 — one directory)', () => {
  it('redirects the retired showcase route to /apps', () => {
    expect(redirectForPath('/showcase')).toBe('/apps');
    expect(redirectForPath('/showcase/')).toBe('/apps');
  });

  it('leaves every live route alone', () => {
    expect(redirectForPath('/apps')).toBeNull();
    expect(redirectForPath('/docs/start/overview')).toBeNull();
    expect(redirectForPath('/')).toBeNull();
    expect(redirectForPath('/new')).toBeNull();
  });
});

describe('parseRoute', () => {
  it('reads the root as home', () => {
    expect(parseRoute('/')).toEqual({ section: 'home', rest: [] });
    expect(parseRoute('')).toEqual({ section: 'home', rest: [] });
  });

  it('reads a bare section', () => {
    // R3-513: `showcase` left SECTIONS — /showcase is a redirect to /apps now,
    // not a route (see redirectForPath).
    expect(parseRoute('/changelog')).toEqual({ section: 'changelog', rest: [] });
  });

  it('reads /new as its own section, not as the home fallback', () => {
    // `new` is in SECTIONS, so a mistyped route and a real one are told apart:
    // an unknown first segment lands on home, and this must not.
    expect(parseRoute('/new')).toEqual({ section: 'new', rest: [] });
    expect(parseRoute('/new/')).toEqual({ section: 'new', rest: [] });
  });

  it('reads the segments after a section as `rest`', () => {
    expect(parseRoute('/docs/start/overview')).toEqual({
      section: 'docs',
      rest: ['start', 'overview'],
    });
    expect(parseRoute('/tutorials/your-first-app')).toEqual({
      section: 'tutorials',
      rest: ['your-first-app'],
    });
  });

  it('tolerates sloppy slashes', () => {
    // Trailing slashes arrive from hand-typed URLs and from some link shorteners; doubled
    // ones from naive string joins. None of them should change where the reader lands.
    expect(parseRoute('/docs/start/overview/')).toEqual(parseRoute('/docs/start/overview'));
    expect(parseRoute('//docs//start//overview')).toEqual(parseRoute('/docs/start/overview'));
    expect(parseRoute('docs/start/overview')).toEqual(parseRoute('/docs/start/overview'));
  });

  it('falls back to home for an unknown section, with NO rest', () => {
    // The fallback is deliberate (a mistyped URL landing on the homepage beats a dead end),
    // but it must not carry the unknown path's segments through as if they were docs args.
    expect(parseRoute('/nonsense/deep/path')).toEqual({ section: 'home', rest: [] });
  });
});

describe('routePath', () => {
  it('renders home as the ROOT, not /home', () => {
    expect(routePath({ section: 'home', rest: [] })).toBe('/');
  });

  it('round-trips every section and sub-path', () => {
    for (const path of [
      '/',
      '/apps',
      '/new',
      '/docs',
      '/docs/start/overview',
      '/tutorials/your-first-app',
      '/changelog',
    ]) {
      expect(routePath(parseRoute(path))).toBe(path);
    }
  });
});

describe('legacyHashPath — every URL the site published before path routing', () => {
  it('translates a legacy route hash', () => {
    expect(legacyHashPath('#/docs/start/overview')).toBe('/docs/start/overview');
    expect(legacyHashPath('#/showcase')).toBe('/showcase');
    expect(legacyHashPath('#/')).toBe('/');
  });

  it('leaves a BARE fragment alone — that is what freeing the fragment was for', () => {
    // A heading permalink is `#the-loop`. Reading it as a legacy route would redirect the
    // reader to `/the-loop`, i.e. the homepage — turning the feature into a bug.
    expect(legacyHashPath('#the-loop')).toBeNull();
    expect(legacyHashPath('#sec-8-9')).toBeNull();
    expect(legacyHashPath('')).toBeNull();
    expect(legacyHashPath('#')).toBeNull();
  });
});

describe('appPathFromSandboxPath', () => {
  it('reads the host-pushed sub-path as an app path', () => {
    expect(appPathFromSandboxPath('docs/start/overview')).toBe('/docs/start/overview');
    expect(appPathFromSandboxPath('/docs/start/overview')).toBe('/docs/start/overview');
  });

  it('treats an absent or empty sub-path as the root', () => {
    // A bare `/present/github/ns/repo/main` with no trailing sub-path is a real URL shape.
    expect(appPathFromSandboxPath(undefined)).toBe('/');
    expect(appPathFromSandboxPath(null)).toBe('/');
    expect(appPathFromSandboxPath('')).toBe('/');
    expect(appPathFromSandboxPath('/')).toBe('/');
  });

  it('accepts the `files/` and `corpus/` spellings of the same route', () => {
    // The SDK's own link builder prefixes `files/` unless you opt out, and the host maps
    // `corpus/…` onto the app's space for a repo with no marker. Both are spellings of this
    // route, not a second space — 404ing on the difference would be a trap.
    expect(appPathFromSandboxPath('files/docs/start/overview')).toBe('/docs/start/overview');
    expect(appPathFromSandboxPath('corpus/docs/start/overview')).toBe('/docs/start/overview');
  });

  it('does not strip a section that merely STARTS with the prefix word', () => {
    expect(appPathFromSandboxPath('filestore/x')).toBe('/filestore/x');
  });
});
