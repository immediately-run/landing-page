// The application-template records (R3-515; FRONT_DOOR_IA §7.2) — data only,
// no React, so component files stay HMR-friendly and /new stays "more records,
// not more page".
//
// NO `fork` kind: forking the template is rejected (APP_ONBOARDING §3.1) and an
// explicit fork exists only for Remix, which is 1.0 (release plan D2).

export interface TemplateRecord {
  slug: string; // 'blank' | 'grove-wiki' | …
  kind: 'blank' | 'app'; // the blank template vs an application template
  name: string; // 'Blank app', 'Wiki, on Grove'
  pitch: string; // one line, sentence case
  gives: string[]; // what you get, 2–4 bullets
  repo: string; // 'immediately-run/new-project-template'
  example?: string; // repo whose present route is "Try it live"
  start:
    | { kind: 'generate' } // GitHub /generate — the repo MUST be flagged as a template
    | { kind: 'run'; route: string } // opens an app that itself does the onboarding
    | { kind: 'unavailable'; reason: string }; // record exists; the card has no start button
}

export const TEMPLATES: TemplateRecord[] = [
  {
    slug: 'blank',
    kind: 'blank',
    name: 'Blank app',
    pitch: 'A minimal React and TypeScript repo with nothing to delete first.',
    gives: ['A src/App.tsx that renders', 'A manifest declaring no capabilities', 'A push-to-publish repo'],
    repo: 'immediately-run/new-project-template',
    example: 'whiteboard',
    start: { kind: 'generate' },
  },
  {
    slug: 'grove-wiki',
    kind: 'app',
    name: 'Wiki, on Grove',
    pitch: 'A wiki that is a folder of markdown files, rendered by Grove.',
    gives: ['One MDX file per entry', 'A corpus marker declaring the entry rule', 'A rendered wiki from the first push'],
    repo: 'immediately-run/grove',
    example: 'grove',
    // Grove is not flagged is_template on GitHub (verified 2026-09-02), and its
    // start mechanism awaits the Grove template decision — so the card renders
    // with Try it live and NO start button. scripts/check-templates.mjs would
    // fail a `generate` record for this repo.
    start: { kind: 'unavailable', reason: 'start mechanism pending the Grove template decision' },
  },
];
