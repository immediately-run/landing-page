// The MDX `<DeepLink>` — a link that opens the live platform pre-loaded to the step's state,
// plus the copy fallback for a blocked popup.

import { useCallback, useState } from 'react';

export default function DeepLink({ label, href }: { label?: string; href?: string }) {
  // Tri-state settle, announced from the role="status" wrapper: "Link copied" on
  // success, "Copy failed" in the same slot on a rejected clipboard write.
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = useCallback(() => {
    if (!href) return;
    navigator.clipboard?.writeText(href).then(
      () => {
        setState('copied');
        window.setTimeout(() => setState('idle'), 1600);
      },
      () => {
        setState('failed');
        window.setTimeout(() => setState('idle'), 1600);
      },
    );
  }, [href]);

  return (
    <div className="tut-deep">
      <a className="tut-deep-pill" href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
      <span role="status">
        <button type="button" className="tut-deep-copy" onClick={copy}>
          {state === 'copied'
            ? 'Link copied'
            : state === 'failed'
              ? 'Copy failed'
              : 'Popup blocked? Copy the link'}
        </button>
      </span>
    </div>
  );
}
