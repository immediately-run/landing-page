import { describe, expect, it } from 'vitest';
import { editRoute, examplePresentPath, presentRoute, WIKI_PRESENT_PATH, HOME_PATH } from './routes';

describe('routes', () => {
  it('presentRoute and editRoute build host paths for an org repo', () => {
    expect(presentRoute('whiteboard')).toBe('/present/github/immediately-run/whiteboard/main/files/src/App.tsx');
    expect(editRoute('whiteboard', 'src/other.tsx', 'feat')).toBe('/edit/github/immediately-run/whiteboard/feat/files/src/other.tsx');
  });

  it('examplePresentPath has no files/ segment — the entry resolves from package.json', () => {
    expect(examplePresentPath('grove')).toBe('/present/github/immediately-run/grove/main');
    expect(examplePresentPath('whiteboard', 'v2')).toBe('/present/github/immediately-run/whiteboard/v2');
  });

  it('the wiki runs as an org app and the door hands to /home in both auth states', () => {
    expect(WIKI_PRESENT_PATH).toBe('/present/github/immediately-run/docs/main');
    expect(HOME_PATH).toBe('/home');
  });
});
