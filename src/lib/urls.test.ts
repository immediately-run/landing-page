import { describe, expect, it } from 'vitest';
import {
  GITHUB_APP_INSTALL_URL,
  GITHUB_ORG_URL,
  NPM_SDK_URL,
  SDK_REFERENCE_URL,
  githubGenerateUrl,
  sdkReferenceUrl,
} from './urls';

describe('external URLs', () => {
  it('keeps the install flow on github.com/apps', () => {
    expect(GITHUB_APP_INSTALL_URL).toBe(
      'https://github.com/apps/immediately-run/installations/new',
    );
  });

  it('keeps the reference base a site ROOT — sdkReferenceUrl joins onto its trailing slash', () => {
    expect(SDK_REFERENCE_URL.endsWith('/')).toBe(true);
    expect(sdkReferenceUrl('llms.txt')).toBe(
      'https://immediately-run.github.io/immediately-run-sdk/llms.txt',
    );
    expect(sdkReferenceUrl('api.json')).toBe(
      'https://immediately-run.github.io/immediately-run-sdk/api.json',
    );
  });

  it('tolerates a leading slash on the file, rather than emitting a double slash', () => {
    expect(sdkReferenceUrl('/llms.txt')).toBe(sdkReferenceUrl('llms.txt'));
  });

  it('the footer links the npm package and the org; /new links the generate flow', () => {
    expect(NPM_SDK_URL).toBe('https://www.npmjs.com/package/@immediately-run/sdk');
    expect(GITHUB_ORG_URL).toBe('https://github.com/immediately-run');
    expect(githubGenerateUrl('immediately-run/blank')).toBe(
      'https://github.com/immediately-run/blank/generate',
    );
  });
});
