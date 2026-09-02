// Cross-component focus plumbing for the omnibox (R3-512). The nav field on `/`
// activates the hero omnibox, and ⌘K focuses whichever omnibox is mounted. The
// mounted instances publish their focus functions here on mount — a module
// registry, not prop drilling through App. Framework-free by design (Fast
// refresh: no components in this file).

const mounts: { hero?: (() => void) | undefined; nav?: (() => void) | undefined } = {};

/** Focus the hero omnibox (no-op when no hero variant is mounted). */
export function focusHeroOmnibox(): void {
  mounts.hero?.();
}

/** Focus whichever omnibox is mounted — hero first, then the nav field. */
export function focusOmnibox(): void {
  return (mounts.hero ?? mounts.nav)?.();
}

export function registerOmniboxFocus(variant: 'hero' | 'nav', fn: () => void): () => void {
  mounts[variant] = fn;
  return () => {
    if (mounts[variant] === fn) mounts[variant] = undefined;
  };
}
