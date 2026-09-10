// @vitest-environment jsdom
import { cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TinkerableContext } from '@immediately-run/sdk/TinkerableContext';
import { CORPUS_INDEX } from '../data/corpusIndex';
import SiteOmnibox from './SiteOmnibox';
import Nav from './Nav';
import { RUN_LABEL } from '../vendor/omnibox';

afterEach(cleanup);

// The §4 runtime-discovery transport, so a routed send has a receiver and completes
// instead of surfacing an unhandled throw. Removed in afterEach, not at the end of the
// case, so a failing assertion cannot leave it installed for the cases after it.
const installHostTransport = () => {
  const sendMessage = vi.fn();
  (globalThis as { __immediatelyRun__?: unknown }).__immediatelyRun__ = {
    transport: { sendMessage, onMessage: () => () => {} },
  };
  return sendMessage;
};
afterEach(() => {
  delete (globalThis as { __immediatelyRun__?: unknown }).__immediatelyRun__;
});

// The site's omnibox, rendered the way the host renders it: inside a context that
// carries a real outer href. This is the seam test the review gate asked for — the
// rows' hrefs are the composition of the site's data (directory records, generated
// corpus index) and the site's resolution (presentRoute, hrefFor), so a drift in
// any of the three shows up here, at the DOM a visitor clicks.
const outerHref = 'https://immediately.run';
const NAV_STATE = { mode: '', namespace: '', repository: '', ref: '', sandboxPath: '', hash: '', search: '' };

const renderSiteOmnibox = () =>
  render(
    // The site app is mounted at the host's root, so its navigation state carries
    // no route segments — hrefFor joins from empty and hosts normalise the
    // collapsed slashes; the seam's contract is the OUTER ORIGIN plus the route.
    <TinkerableContext
      value={
        {
          outerHref,
          navigationState: { mode: '', namespace: '', repository: '', ref: '', sandboxPath: '', hash: '', search: '' },
        } as never
      }
    >
      <SiteOmnibox variant="hero" />
    </TinkerableContext>,
  );

/** How many buttons the name computation can find by CONTENT alone — the question the
 *  mobile rule turns into "none". */
const withoutAriaLabel = (el: HTMLElement): number => {
  const had = el.getAttribute('aria-label');
  el.removeAttribute('aria-label');
  const n = screen.queryAllByRole('button', { name: /[\p{L}\p{N}]/u }).filter((b) => b === el).length;
  if (had !== null) el.setAttribute('aria-label', had);
  return n;
};

const type = (query: string) => {
  fireEvent.change(screen.getByRole('combobox'), { target: { value: query } });
};

// What makes a corpus entry findable through the omnibox: a title whose first
// word is long enough to be a real query. One definition, two cases.
const entryWithLongFirstWord = () =>
  CORPUS_INDEX.find((e) => String(e.frontmatter.title ?? '').trim().split(/\s+/)[0].length >= 4);

describe('SiteOmnibox against the host location', () => {
  it("typing an app name resolves the app row through the site's own route builder", () => {
    renderSiteOmnibox();
    type('whiteboard');
    const rows = screen.getAllByRole('option');
    expect(rows[0].textContent).toContain('Whiteboard');
    expect(rows[0].getAttribute('href')).toBe(
      `${outerHref}/present/github/immediately-run/whiteboard/main/files/src/App.tsx`,
    );
    // `_top` is a same-context target, which is what PlatformLink's click handling keys on
    // (and the anchor's own behaviour when there is no host). On a plain click inside the
    // frame the sandbox refuses it — the next case asserts what escapes instead.
    expect(rows[0].getAttribute('target')).toBe('_top');
  });

  it('a plain left click on the app row asks the host to navigate to the outer href (R3-568)', () => {
    // The escape is PlatformLink's click handler: it cancels the frame navigation the
    // sandbox would refuse, and sends the host a urlchange for the same href the anchor
    // advertises. An sdk pin from before R3-568 (0.60.0) leaves the click to `_top`,
    // so neither assertion holds.
    renderSiteOmnibox();
    type('whiteboard');
    const appRow = screen.getAllByRole('option')[0];
    const sendMessage = installHostTransport();
    const evt = createEvent.click(appRow, { button: 0 });
    fireEvent(appRow, evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(sendMessage).toHaveBeenCalledWith(
      'urlchange',
      expect.objectContaining({ url: appRow.getAttribute('href') }),
    );
  });

  it('doc rows render as in-app links whose href is real and absolute on the host origin', () => {
    const entry = entryWithLongFirstWord();
    expect(entry).toBeTruthy();
    renderSiteOmnibox();
    type(String(entry!.frontmatter.title).split(/\s+/)[0].toLowerCase());
    const docRow = screen
      .getAllByRole('option')
      .find((el) => el.textContent?.includes(String(entry!.frontmatter.title)));
    expect(docRow).toBeTruthy();
    // The expected href, built the way the corpus source builds routes: docs
    // entries route as /docs/<group>/<slug>, everything else as its path.
    const expectedTo = entry!.path.startsWith('docs/')
      ? `/docs/${entry!.slug.split('--')[0]}/${entry!.slug.split('--')[1]}`
      : `/${entry!.path.replace(/\.mdx$/, '')}`;
    const href = docRow!.getAttribute('href') ?? '';
    expect(href.replace(/^(https:\/\/immediately.run)\/+/, '$1/')).toBe(`${outerHref}${expectedTo}`);
    // And it is the site's in-app link, not a frame-navigating plain anchor.
    expect(docRow!.getAttribute('target')).toBeNull();
  });

  it('an unmodified left click on a doc row is intercepted and routed in-app', () => {
    // The assertion that discriminates the renderDoc seam: SiteLink prevents the
    // default and asks the host to push the route; the package's fallback anchor
    // would let the click navigate the sandboxed frame (defaultPrevented false).
    const entry = entryWithLongFirstWord();
    renderSiteOmnibox();
    type(String(entry!.frontmatter.title).split(/\s+/)[0].toLowerCase());
    const docRow = screen
      .getAllByRole('option')
      .find((el) => el.textContent?.includes(String(entry!.frontmatter.title)));
    expect(docRow).toBeTruthy();
    const sendMessage = installHostTransport();
    const evt = createEvent.click(docRow!);
    fireEvent(docRow!, evt);
    expect(evt.defaultPrevented).toBe(true);
    // The interception routed the click through the host, not a frame navigation.
    expect(sendMessage).toHaveBeenCalled();
  });
});

// R3-570 — the submit control's accessible NAME, at every breakpoint.
//
// This is a jsdom test of a bug that only *shows* at 390px, and that is deliberate: the
// mobile presentation is `.omnibox-run-label { display: none }` at <=720px, so what the
// narrow viewport does is remove name-from-content. A test that asserted the rendered text
// would therefore pass at both widths and catch nothing. Asserting the name through the
// role+name query — the same computation a screen reader runs — is what makes the width
// irrelevant: if the name survives only because the label text is present, `aria-label` is
// missing and this fails.
//
// The expected name comes from the component's own exported constant, not a second copy of
// the word typed here; a test spelling 'Run' again would stay green if both drifted.
describe('the omnibox submit is nameable (R3-570)', () => {
  it('is named while DISABLED — the state a visitor first meets, and the one that shipped unnamed', () => {
    renderSiteOmnibox();
    // Empty input ⇒ nothing to run ⇒ the disabled <button> branch.
    const run = screen.getByRole('button', { name: RUN_LABEL });
    expect(run.getAttribute('aria-disabled')).toBe('true');
    expect(run.getAttribute('aria-label')).toBe(RUN_LABEL);
  });

  it('is still named once a repo is typed and it becomes the run link', () => {
    renderSiteOmnibox();
    type('github:immediately-run/whiteboard');
    const run = screen.getByRole('link', { name: RUN_LABEL });
    expect(run.getAttribute('aria-label')).toBe(RUN_LABEL);
  });

  it('names it from an ATTRIBUTE, so it survives the mobile rule that hides the label text', () => {
    // The production mechanism itself, not a stand-in for it: the mobile rule is
    // `display: none`, and the name computation honours computed display, so hiding the
    // label here removes name-from-content exactly as a 390px viewport does. (Removing the
    // node instead would skip the hidden-subtree branch of the algorithm — a different
    // operation that happens to look the same.)
    renderSiteOmnibox();
    const run = screen.getByRole('button', { name: RUN_LABEL });
    const label = run.querySelector<HTMLElement>('.omnibox-run-label');
    expect(label).not.toBeNull();
    label!.style.display = 'none';
    // Non-vacuity: with the label hidden, content alone names nothing — so a pass below is
    // the attribute, and only the attribute.
    expect(withoutAriaLabel(run)).toBe(0);
    expect(screen.getByRole('button', { name: RUN_LABEL })).toBe(run);
  });

  it('every control in the NAV BAR has a name — the set the item names, asserted whole', () => {
    // The item's third decision: the search, theme and menu controls are named today and
    // only the submit was unnamed, so this is a miss rather than a pattern — "but assert the
    // whole bar so it stays that way". That bar is `Nav`, not the omnibox alone: rendering
    // only `SiteOmnibox variant="hero"` yields one button and one combobox and no links, so
    // asserting it would have been two tautologies and an `expect(0).toEqual(0)`.
    render(
      <TinkerableContext value={{ outerHref, navigationState: NAV_STATE } as never}>
        {/* `docs`, not `home`: on home the nav omnibox collapses to a shortcut button
            (the hero one is on screen), so the bar would carry no combobox and the role
            loop below would have nothing to assert for it. */}
        <Nav active="docs" />
      </TinkerableContext>,
    );
    const NAMED = /[\p{L}\p{N}]/u;
    for (const role of ['button', 'link', 'combobox'] as const) {
      const all = screen.queryAllByRole(role);
      // Non-vacuity per role: a role that matches nothing cannot pass by matching nothing.
      expect({ role, present: all.length > 0 }).toEqual({ role, present: true });
      expect({ role, named: screen.queryAllByRole(role, { name: NAMED }).length }).toEqual({
        role,
        named: all.length,
      });
    }
    // And by name, so a rename is a failure rather than a silent pass: the controls the item
    // enumerates are all here.
    expect(screen.getByRole('button', { name: RUN_LABEL })).toBeTruthy();
    expect(screen.getByRole('button', { name: /search apps and docs/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /switch to (light|dark) theme/i })).toBeTruthy();
  });
});

