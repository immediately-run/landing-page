// The MDX `<CodeBlock route="…">` wrapper. The code itself arrives as a fenced block in the
// MDX body — so it stays readable, diffable and syntax-highlightable in the source file,
// which a `code:` string field in a TypeScript record never was.

import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export default function CodeBlock({ route, children }: { route?: string; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const copy = useCallback(() => {
    // Read the rendered text rather than threading the source through a prop: the fence is
    // the source of truth, and anything else is a second copy that can drift from it.
    const text = bodyRef.current?.innerText ?? '';
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => undefined,
    );
  }, []);

  return (
    <div className="docs-codeblock">
      <div className="docs-codebar">
        <span className="docs-codebar-route">{route}</span>
        <button type="button" className="docs-copy" aria-label="Copy code" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div ref={bodyRef}>{children}</div>
    </div>
  );
}
