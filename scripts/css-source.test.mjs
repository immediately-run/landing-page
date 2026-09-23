import { describe, expect, it } from 'vitest';
import { cssFiles, cssRules, stripComments } from './css-source.mjs';

describe('css-source', () => {
  it('strips comments without changing rule text', () => {
    expect(stripComments('/* top: 90px */ .x{top:var(--nav-h)}')).toBe('  .x{top:var(--nav-h)}');
  });

  it('flattens a flat rule', () => {
    expect(cssRules('.x{background:var(--grad-btn)}')).toEqual([['.x', 'background:var(--grad-btn)']]);
  });

  it('flattens a rule nested in @media as its own rule', () => {
    expect(cssRules('@media (max-width:720px){.x{background:var(--grad-btn)}}')).toEqual([
      ['.x', 'background:var(--grad-btn)'],
    ]);
  });

  it('reads the real src tree as [basename, text] pairs', () => {
    const files = cssFiles('src');
    expect(files.length).toBeGreaterThan(0);
    for (const [name, text] of files) {
      expect(name.endsWith('.css')).toBe(true);
      expect(typeof text).toBe('string');
    }
    expect(files.some(([name]) => name === 'App.css')).toBe(true);
  });
});
