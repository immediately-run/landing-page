import { describe, expect, it } from 'vitest';
import { GITHUB_APP_INSTALL_URL, SDK_REFERENCE_URL, sdkReferenceUrl } from './urls';

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
});
