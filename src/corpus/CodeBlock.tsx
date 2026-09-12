// The MDX `<CodeBlock route="…">` wrapper. The code itself arrives as a fenced block in the
// MDX body — so it stays readable, diffable and syntax-highlightable in the source file,
// which a `code:` string field in a TypeScript record never was.

import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export default function CodeBlock({ route, children }: { route?: string; children?: ReactNode }) {
  // Tri-state, because a rejected copy is a status too (WCAG 4.1.3 + 3.3.1): the
  // settle — success OR failure — is announced from the role="status" wrapper and
  // rendered in the same text slot.
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const bodyRef = useRef<HTMLDivElement>(null);

  const copy = useCallback(() => {
    // Read the rendered text rather than threading the source through a prop: the fence is
    // the source of truth, and anything else is a second copy that can drift from it.
    const text = bodyRef.current?.innerText ?? '';
    navigator.clipboard?.writeText(text).then(
      () => {
        setState('copied');
        window.setTimeout(() => setState('idle'), 1600);
      },
      () => {
        setState('failed');
        window.setTimeout(() => setState('idle'), 1600);
      },
    );
  }, []);

  return (
    <div className="docs-codeblock">
      <div className="docs-codebar">
        <span className="docs-codebar-route">{route}</span>
        {/* No static aria-label: the visible text is the accessible name (WCAG 2.5.3).
            The role="status" wrapper announces the settle without stealing focus. */}
        <span className="docs-copy-slot" role="status">
          <button type="button" className="docs-copy" onClick={copy}>
            {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}
          </button>
        </span>
      </div>
      <div ref={bodyRef}>{children}</div>
    </div>
  );
}
