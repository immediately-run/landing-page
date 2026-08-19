// The MDX `<DeepLink>` — a link that opens the live platform pre-loaded to the step's state,
// plus the copy fallback for a blocked popup.

import { useCallback, useState } from 'react';

export default function DeepLink({ label, href }: { label?: string; href?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    if (!href) return;
    navigator.clipboard?.writeText(href).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => undefined,
    );
  }, [href]);

  return (
    <div className="tut-deep">
      <a className="tut-deep-pill" href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
      <button type="button" className="tut-deep-copy" onClick={copy}>
        {copied ? 'Link copied' : 'Popup blocked? Copy the link'}
      </button>
    </div>
  );
}
