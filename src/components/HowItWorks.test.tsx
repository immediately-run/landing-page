// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import HowItWorks, { PLATFORM_SENTENCE, TAB_SENTENCE } from './HowItWorks';

// The cue these two tests guard is the reason this file exists rather than the
// section being deleted outright. WORKBENCH_MODES_SPEC §4 puts the two sentences
// on the front door, once, in the product's voice; the 1a redesign removed the
// Run section that carried them. The obligation survived the section, and only a
// test keeps that true through the next redesign.

afterEach(cleanup);

describe('HowItWorks (the front door in three steps)', () => {
  it('teaches the WORKBENCH_MODES §4 cue, verbatim and exactly once', () => {
    const { container } = render(<HowItWorks />);
    const cue = container.querySelector('p.how-cue');
    expect(cue).not.toBeNull();
    expect(cue?.textContent).toBe(`${TAB_SENTENCE} ${PLATFORM_SENTENCE}`);
    // "Taught once" is the spec's word: a second copy anywhere in the section is
    // as wrong as none, because the cue stops reading as the product's voice.
    for (const sentence of [TAB_SENTENCE, PLATFORM_SENTENCE]) {
      expect(container.textContent?.split(sentence).length - 1).toBe(1);
    }
  });

  it('renders the cue inside the section, not floating beside it', () => {
    const { container } = render(<HowItWorks />);
    const section = container.querySelector('section.how');
    expect(section?.contains(container.querySelector('p.how-cue'))).toBe(true);
  });

  it('renders three steps, numbered in order, each with a title and a line', () => {
    const { container } = render(<HowItWorks />);
    const steps = [...container.querySelectorAll('.how-step')];
    expect(steps).toHaveLength(3);
    expect(steps.map((s) => s.querySelector('.how-num')?.textContent)).toEqual(['01', '02', '03']);
    expect(steps.map((s) => s.querySelector('h3')?.textContent)).toEqual(['Open', 'Tinker', 'Push']);
    for (const step of steps) {
      expect(step.querySelector('p')?.textContent?.length).toBeGreaterThan(20);
    }
  });

  it('gives the section a real heading, not a hidden twin of its own eyebrow', () => {
    const { container } = render(<HowItWorks />);
    const h2 = container.querySelector('h2.how-tag');
    expect(h2?.id).toBe('how');
    expect(container.querySelector('section.how')?.getAttribute('aria-labelledby')).toBe('how');
    // The slash is decoration; the accessible name is the words.
    expect(h2?.textContent).toBe('/HOW IT WORKS');
    expect(h2?.querySelector('[aria-hidden="true"]')?.textContent).toBe('/');
  });

  it('hides the decorative numerals from assistive tech', () => {
    // They are ordinals in a list that already reads in order; announced, they
    // are noise between the heading and the sentence that carries the meaning.
    const { container } = render(<HowItWorks />);
    for (const num of container.querySelectorAll('.how-num')) {
      expect(num.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
