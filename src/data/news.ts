// Content for the "What's new" changelog list.

export type BadgeKind = 'feat' | 'rel' | 'note';

export interface NewsItem {
  version: string;
  badge: BadgeKind;
  badgeLabel: string;
  message: string;
  date: string;
}

export const NEWS: NewsItem[] = [
  {
    version: 'v2.4',
    badge: 'feat',
    badgeLabel: 'Feature',
    message: 'Tweak panels now support color palettes',
    date: 'May 26',
  },
  {
    version: 'v2.3',
    badge: 'rel',
    badgeLabel: 'Release',
    message: 'Offline bundling leaves beta',
    date: 'May 12',
  },
  {
    version: '—',
    badge: 'note',
    badgeLabel: 'Note',
    message: 'Tinker Day meetup — June 20, online',
    date: 'May 4',
  },
  {
    version: 'v2.2',
    badge: 'rel',
    badgeLabel: 'Release',
    message: 'Runtime trimmed to 3.1kb gzipped',
    date: 'Apr 30',
  },
];
