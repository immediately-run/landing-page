import { describe, expect, it } from 'vitest';
import {
  generateRepos,
  readRecords,
  repoApiUrl,
  TOKEN_VAR,
  verifyTemplate,
} from './check-templates.mjs';

// The checker guards one claim: a `generate` record promises that
// github.com/<repo>/generate works, which is true only for a repo GitHub has
// flagged is_template. Nothing here talks to the network — `verifyTemplate`
// takes its fetch — but the first cases read the REAL records file, so a record
// this checker can no longer see fails right here.

interface Record {
  slug: string;
  repo: string;
  start: { kind: string };
}

const okResponse = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

describe('generateRepos, over the real src/data/templates.json', () => {
  const records = readRecords() as Record[];

  it('reads every shipped record', () => {
    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(typeof record.repo).toBe('string');
      expect(record.repo).not.toBe('');
      expect(['generate', 'run', 'unavailable']).toContain(record.start.kind);
    }
  });

  it('selects exactly the repos that claim a GitHub generate flow', () => {
    const expected = records.filter((r) => r.start.kind === 'generate').map((r) => r.repo);
    expect(generateRepos(records)).toEqual(expected);
  });

  it('leaves grove out — its record is `unavailable` precisely because it is not a template', () => {
    expect(generateRepos(records)).not.toContain('immediately-run/grove');
  });
});

describe('generateRepos', () => {
  it('ignores `run` and `unavailable` records', () => {
    expect(
      generateRepos([
        { slug: 'a', repo: 'o/a', start: { kind: 'run', route: '/present/github/o/a/main' } },
        { slug: 'b', repo: 'o/b', start: { kind: 'unavailable', reason: 'pending' } },
      ]),
    ).toEqual([]);
  });

  it('THROWS on a record with no repo, rather than passing by absence', () => {
    expect(() => generateRepos([{ slug: 'a', start: { kind: 'generate' } }])).toThrowError(/'a'/);
  });

  it('THROWS when the records file is not an array', () => {
    expect(() => generateRepos({ slug: 'a' })).toThrowError(/array/);
  });
});

describe('verifyTemplate', () => {
  it('passes a repo GitHub flags is_template', async () => {
    const result = await verifyTemplate('o/a', async () => okResponse({ is_template: true }), {});
    expect(result).toEqual({ repo: 'o/a', ok: true, message: 'o/a is_template: true' });
  });

  it('FAILS a repo that is not flagged, and says what to do about it', async () => {
    const result = await verifyTemplate('o/a', async () => okResponse({ is_template: false }), {});
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/is not flagged is_template/);
    expect(result.message).toMatch(/unavailable/);
  });

  it('FAILS on a missing is_template field — absent is not true', async () => {
    const result = await verifyTemplate('o/a', async () => okResponse({}), {});
    expect(result.ok).toBe(false);
  });

  it('names the URL and the token variable when the API is unreachable', async () => {
    const result = await verifyTemplate(
      'o/a',
      async () => {
        throw new Error('getaddrinfo ENOTFOUND api.github.com');
      },
      {},
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain(repoApiUrl('o/a'));
    expect(result.message).toContain(TOKEN_VAR);
    expect(result.message).toContain('ENOTFOUND');
  });

  it('names the URL and the status on a non-ok answer', async () => {
    const result = await verifyTemplate('o/a', async () => ({ ok: false, status: 404 }), {});
    expect(result.ok).toBe(false);
    expect(result.message).toContain('404');
    expect(result.message).toContain(repoApiUrl('o/a'));
  });

  it('sends the User-Agent INSIDE headers — as a fetch option it was never sent', async () => {
    let init: { headers: Record<string, string> } | undefined;
    await verifyTemplate(
      'o/a',
      async (_url: string, got: { headers: Record<string, string> }) => {
        init = got;
        return okResponse({ is_template: true });
      },
      {},
    );
    expect(init?.headers['User-Agent']).toBe('immediately-run-landing-check-templates');
    expect(Object.keys(init ?? {})).toEqual(['headers']);
  });

  it('sends the token as a bearer credential when the env var is set', async () => {
    let init: { headers: Record<string, string> } | undefined;
    await verifyTemplate(
      'o/a',
      async (_url: string, got: { headers: Record<string, string> }) => {
        init = got;
        return okResponse({ is_template: true });
      },
      { [TOKEN_VAR]: 'ghp_example' },
    );
    expect(init?.headers.Authorization).toBe('Bearer ghp_example');
  });

  it('sends no Authorization header when the env var is absent, and says so on failure', async () => {
    let init: { headers: Record<string, string> } | undefined;
    const result = await verifyTemplate(
      'o/a',
      async (_url: string, got: { headers: Record<string, string> }) => {
        init = got;
        return { ok: false, status: 403 };
      },
      {},
    );
    expect(init?.headers.Authorization).toBeUndefined();
    expect(result.message).toContain(TOKEN_VAR);
  });
});
