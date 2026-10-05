// @vitest-environment jsdom
// The docs heading permalink used to read `var(--muted)`, a token nothing
// declared — invalid at computed-value time, so `color` behaved as `unset` and
// the anchor inherited its heading's ink (and the rule's own `opacity: 0` hid
// it until hover regardless) (R3-744). The pin: the element
// still carries its class, and the class's rule resolves to the declared
// `--muted` token. jsdom cannot resolve var() to a computed colour, so the
// token wiring is pinned by reading the real stylesheets as data (the
// behavioural guard — no undeclared var() anywhere — is `check:tokens`).
// (node:fs, not `?raw`: Vite's CSS pipeline empties `.css?raw` in vitest.)
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import HeadingAnchor from './HeadingAnchor';

afterEach(cleanup);

const docsCss = readFileSync(join(process.cwd(), 'src/sections/docs/docs.css'), 'utf8');
const tokensCss = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');

/** The declaration body of one block in a stylesheet (crude but readable:
 *  these two files carry no nested braces inside the blocks we read). */
const blockBody = (css: string, selector: string): string => {
  const at = css.indexOf(selector);
  expect(at, `${selector} not found`).toBeGreaterThanOrEqual(0);
  return css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at));
};

describe('HeadingAnchor (the docs permalink)', () => {
  it('renders the permalink anchor on its docs-heading-anchor class', () => {
    const { container } = render(<HeadingAnchor id="overview" />);
    const a = container.querySelector('a.docs-heading-anchor');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('href')).toContain('#overview');
  });

  it('the anchor’s colour rule reads --muted, declared in index.css in both polarities', () => {
    expect(blockBody(docsCss, '.docs-heading-anchor')).toContain('color: var(--muted)');
    expect(blockBody(tokensCss, ':root')).toMatch(/--muted\s*:/);
    expect(blockBody(tokensCss, 'html[data-theme="light"]')).toMatch(/--muted\s*:/);
  });
});
