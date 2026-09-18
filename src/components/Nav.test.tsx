// @vitest-environment jsdom
// R3-611 (R-IX-1; 2.1.1/2.1.2/2.4.3/4.1.2) — the mobile nav sheet's dialog
// contract: focus in on open, back to the burger on close, Tab wraps within,
// Escape dismisses. The rows asserted are the REAL NAV_ITEMS the component
// renders (labels pinned so a data drift shows here), and the omnibox row needs
// no special case — the wrap is document-order and it is inside it.
//
// Plain expects, per this repo's harness (SiteOmnibox.test.tsx) — no jest-dom
// matcher package is installed here, and none is being added for this item.
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Nav from './Nav';

afterEach(cleanup);

// The §4 runtime-discovery transport (same reason as SiteOmnibox.test.tsx): the
// nav sheet's omnibox row wants a receiver for a routed send. Removed in
// afterEach so a failing assertion cannot leave it installed for the cases
// after it.
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

const REAL_LINK_LABELS = ['Apps', 'Docs', 'Tutorials', "What's new"];

const openSheet = () => {
  installHostTransport();
  render(<Nav active="apps" />);
  const burger = screen.getByRole('button', { name: 'Open menu' });
  burger.focus();
  fireEvent.click(burger);
  const sheet = screen.getByRole('dialog', { name: 'Menu' });
  return { burger, sheet };
};

describe('Nav — the mobile sheet is a real dialog (R3-611)', () => {
  it('the sheet carries the dialog semantics it now behaves as', () => {
    const { sheet } = openSheet();
    expect(sheet.getAttribute('aria-modal')).toBe('true');
    expect(sheet.getAttribute('aria-label')).toBe('Menu');
  });

  it('opening moves focus to the sheet own Close button', () => {
    openSheet();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close menu' }));
  });

  it('Escape unmounts the sheet and focus returns to the burger', () => {
    const { burger } = openSheet();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(burger);
  });

  it('Tab wraps within the sheet — the last focusable returns to Close, and Close shifts to it', () => {
    const { sheet } = openSheet();
    const inSheet = within(sheet);
    const close = inSheet.getByRole('button', { name: 'Close menu' });
    // The sheet's theme button is the last focusable in its DOM order
    // (top row → omnibox → links → door → theme); scoped to the sheet because
    // the desktop bar carries a theme button of its own.
    const theme = inSheet.getByRole('button', { name: /Switch to (dark|light) theme/ });
    theme.focus();
    fireEvent.keyDown(theme, { key: 'Tab' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(theme);
  });

  it('the sheet renders the REAL NAV_ITEMS rows plus Make an app', () => {
    const { sheet } = openSheet();
    // Scoped to the sheet: the desktop nav renders the same items, and the
    // assertion is about the SHEET's rows.
    const inSheet = within(sheet);
    for (const label of REAL_LINK_LABELS) {
      expect(inSheet.getByRole('link', { name: label })).toBeTruthy();
    }
    expect(inSheet.getByRole('link', { name: 'Make an app' })).toBeTruthy();
  });
});
