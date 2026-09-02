import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { usePlatformHref } from '../hooks/useRoute';

// The ONE way to render an anchor to a PLATFORM route (`/present/…`, `/edit/…`,
// `/home`) — R3-513 / FRONT_DOOR_IA §5.6. It builds the href with `platformHref`
// (a root-relative href inside the sandboxed frame would resolve against the
// SANDBOX origin and land nowhere) and always carries `target="_top"`, because
// an anchor inside the sandboxed frame otherwise navigates the frame instead of
// the page. Rendering a platform route through anything else is the defect this
// component exists to make un-repeatable.

interface PlatformLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** A root-relative platform path, e.g. `/present/github/acme/todo`. */
  path: string;
  children?: ReactNode;
}

export default function PlatformLink({ path, children, ...rest }: PlatformLinkProps) {
  const platform = usePlatformHref();
  return (
    <a {...rest} href={platform(path)} target="_top">
      {children}
    </a>
  );
}
