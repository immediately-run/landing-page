// @vitest-environment jsdom
import { cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TinkerableContext } from '@immediately-run/sdk/TinkerableContext';
import { CORPUS_INDEX } from '../data/corpusIndex';
import SiteOmnibox from './SiteOmnibox';

afterEach(cleanup);

// The site's omnibox, rendered the way the host renders it: inside a context that
// carries a real outer href. This is the seam test the review gate asked for — the
// rows' hrefs are the composition of the site's data (directory records, generated
// corpus index) and the site's resolution (presentRoute, hrefFor), so a drift in
// any of the three shows up here, at the DOM a visitor clicks.
const outerHref = 'https://immediately.run';

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
    // The app row is a platform route: it must escape the frame.
    expect(rows[0].getAttribute('target')).toBe('_top');
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
    // Install the §4 runtime-discovery transport first, so the routed send has a
    // receiver and navigateTo completes instead of surfacing an unhandled throw.
    const entry = entryWithLongFirstWord();
    renderSiteOmnibox();
    type(String(entry!.frontmatter.title).split(/\s+/)[0].toLowerCase());
    const docRow = screen
      .getAllByRole('option')
      .find((el) => el.textContent?.includes(String(entry!.frontmatter.title)));
    expect(docRow).toBeTruthy();
    const sendMessage = vi.fn();
    (globalThis as { __immediatelyRun__?: unknown }).__immediatelyRun__ = {
      transport: { sendMessage, onMessage: () => () => {} },
    };
    const evt = createEvent.click(docRow!);
    fireEvent(docRow!, evt);
    expect(evt.defaultPrevented).toBe(true);
    // The interception routed the click through the host, not a frame navigation.
    expect(sendMessage).toHaveBeenCalled();
    delete (globalThis as { __immediatelyRun__?: unknown }).__immediatelyRun__;
  });
});
