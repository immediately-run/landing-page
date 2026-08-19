// The site's internal link. Every in-site navigation goes through this.
//
// It renders a REAL href — an absolute host URL on immediately.run, a plain path locally —
// so copy-link, middle-click and open-in-new-tab all produce something that resolves for
// another reader. The click is intercepted and routed instead, because a full page load to
// the URL you are already on is not navigation.
//
// Modified clicks (cmd/ctrl/shift/alt, middle button) and an explicit `target` are left to
// the browser: those gestures MEAN "open the href", and the href is exactly right.
//
// This is the SDK's own `Link` contract, reimplemented for one reason: `Link` builds hrefs
// with the `files/` prefix and offers no way to opt out, and the site's routes are routes
// rather than files. The interception semantics are copied deliberately, including the trap
// the SDK's own comment records — spread props FIRST, so a caller's `onClick` composes with
// the interception instead of silently replacing it.

import { useCallback } from 'react';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { hrefFor, navigateTo } from '../lib/navigation';
import { useHostLocation } from '../hooks/useRoute';

export default function SiteLink({
  to,
  children,
  onClick,
  target,
  ...rest
}: { to: string; children?: ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>) {
  const loc = useHostLocation();
  const href = hrefFor(loc, to);

  const clickHandler = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (target && target !== '_self') return;
      e.preventDefault();
      navigateTo(loc, to);
    },
    [loc, onClick, target, to],
  );

  return (
    <a {...rest} href={href} target={target} onClick={clickHandler}>
      {children}
    </a>
  );
}
