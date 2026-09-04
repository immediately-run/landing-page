// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import RunSection from './RunSection';
import { RUN_TILE_REPOS } from '../data/apps';

// WORKBENCH_MODES_SPEC §4 ("Taught once") — the front door's Run section carries
// the spec's two sentences verbatim, owner-confirmed wording: the tab proves a
// published app; platform surfaces name themselves and open the platform menu.
const TAB_SENTENCE = 'The pull-down tab means you are looking at an app someone published.';
const PLATFORM_SENTENCE =
  'Platform surfaces carry the immediately.run name and open the platform menu.';

afterEach(cleanup);

describe('RunSection (the /RUN taught cue)', () => {
  it('teaches the two sentences once, inside the /RUN section', () => {
    const { container } = render(<RunSection />);
    const section = screen.getByRole('region');
    const cue = container.querySelector('p.run-cue');
    expect(cue).not.toBeNull();
    expect(section.contains(cue)).toBe(true);
    expect(cue?.textContent).toBe(`${TAB_SENTENCE} ${PLATFORM_SENTENCE}`);
    for (const sentence of [TAB_SENTENCE, PLATFORM_SENTENCE]) {
      expect(container.textContent?.split(sentence).length - 1).toBe(1);
    }
  });

  it('renders the four tiles from the real RUN_TILE_REPOS selection', () => {
    const { container } = render(<RunSection />);
    const grid = container.querySelector('.show-grid');
    expect(grid?.children).toHaveLength(RUN_TILE_REPOS.length);
    expect(grid?.querySelector('a[href^="/present/github/"][href*="/whiteboard/"]')).not.toBeNull();
  });
});
