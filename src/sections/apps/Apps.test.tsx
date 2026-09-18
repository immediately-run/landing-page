// @vitest-environment jsdom
// R3-611 (R-IX-1) — the apps filters sheet now behaves as the dialog it always
// claimed to be: the attributes stay (they come from the hook now), Escape
// joins the backdrop click as a dismissal, and focus returns to the Filters
// button. Rendered over the REAL apps data the section ships. Plain expects,
// per this repo's harness (SiteOmnibox.test.tsx).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Apps from './Apps';

afterEach(cleanup);

const openFilters = () => {
  render(<Apps />);
  // Anchored: the sheet's own control is "Close filters", which also matches a
  // bare /Filters/.
  const trigger = screen.getByRole('button', { name: /^Filters/ });
  trigger.focus();
  fireEvent.click(trigger);
  const sheet = screen.getByRole('dialog', { name: 'Filters' });
  return { trigger, sheet };
};

describe('Apps — the filters sheet keeps its promises (R3-611)', () => {
  it('the dialog attributes are on the rendered backdrop node', () => {
    const { sheet } = openFilters();
    expect(sheet.getAttribute('aria-modal')).toBe('true');
    expect(sheet.className).toContain('apps-sheet-backdrop');
  });

  it('focus moves in on open and returns to the Filters button on close', () => {
    const { trigger } = openFilters();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close filters' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape and the backdrop click both dismiss', () => {
    const { trigger } = openFilters();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    // Reopen from the same trigger (one tree — a second render would mount a
    // second Filters button), then close through the backdrop itself.
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('dialog', { name: 'Filters' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
