// Content for the "Built with immediately.run" showcase grid.
// Pure data — no React here, so component files stay HMR-friendly.

export interface ShowcaseTile {
  name: string;
  slug: string;
  blurb: string;
  tag: string;
  /** Star count shown as a "★ {stars}" badge. Omit to hide the badge. */
  stars?: string;
  /** Grid footprint: `big` spans 4 columns, `sm` spans 2. */
  size: 'big' | 'sm';
  /** Optional colour treatment. */
  variant?: 'accent' | 'blue';
  /** Adds a " · featured" suffix to the corner label. */
  featured?: boolean;
}

export const SHOWCASE: ShowcaseTile[] = [
  {
    name: 'Synth Pad',
    slug: 'synth-pad',
    blurb:
      'A fully playable synthesizer in one 14 kb file. Drag any knob and the oscillator rewires live.',
    tag: '#creative',
    stars: '2.1k',
    size: 'big',
    featured: true,
  },
  {
    name: 'CSV Lens',
    slug: 'csv-lens',
    blurb: 'Drop a CSV, get charts. Nothing uploads.',
    tag: '#data',
    stars: '1.8k',
    size: 'sm',
    variant: 'accent',
  },
  {
    name: 'Pomodoro Garden',
    slug: 'pomodoro-garden',
    blurb: 'A timer that grows plants.',
    tag: '#productivity',
    size: 'sm',
  },
  {
    name: 'Pixel Pad',
    slug: 'pixel-pad',
    blurb: 'Tiny sprite editor, PNG export.',
    tag: '#creative',
    size: 'sm',
    variant: 'blue',
  },
  {
    name: 'Habit Dots',
    slug: 'habit-dots',
    blurb: 'A year of habits on one screen.',
    tag: '#tracking',
    size: 'sm',
  },
];
