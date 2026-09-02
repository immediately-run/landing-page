// The application-template records (R3-515; FRONT_DOOR_IA §7.2).
//
// The records themselves live in `templates.json`, not in this file: the
// `verify` step has to read them from outside the bundler, and a script that
// greps a `.ts` file for `slug:` is a parser that fails silently the day the
// formatting changes. JSON is data both a module and a script can read.
//
// This module is the TYPE and the typed view of that data. The array is asserted
// rather than validated at load — the shape is checked by the checker's tests,
// which read the same file.
//
// NO `fork` kind: forking the template is rejected (APP_ONBOARDING §3.1) and an
// explicit fork exists only for Remix, which is 1.0 (release plan D2).
//
// `grove` is deliberately `unavailable`: it is not flagged is_template on GitHub
// (verified 2026-09-02), so a `generate` record for it would ship a button that
// 404s — which is what scripts/check-templates.mjs exists to catch.

import records from './templates.json';

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

export const TEMPLATES = records as TemplateRecord[];
