// The component map an MDX corpus entry resolves its custom tags against.
//
// A data module (no component defined here), so the Fast Refresh rule is satisfied by
// re-export. Passed to each compiled entry as `components={CORPUS_COMPONENTS}` — the MDX
// runtime's own mechanism, no provider needed.
//
// This is the whole "custom components" answer that made MDX viable for a content-heavy but
// non-prose site: the structured parts (an API signature's params and rejections, an example
// app's two CTAs) stay STRUCTURED as JSX expression props, and only the prose around them
// becomes markdown. Flattening those into paragraphs would have been the same mistake as
// keeping the prose in TypeScript, in the other direction.

import ApiSignature from './ApiSignature';
import Callout from './Callout';
import Checkpoint from './Checkpoint';
import CodeBlock from './CodeBlock';
import DeepLink from './DeepLink';
import Example from './Example';
import HeadingAnchor from './HeadingAnchor';

export const CORPUS_COMPONENTS = {
  ApiSignature,
  Callout,
  Checkpoint,
  CodeBlock,
  DeepLink,
  Example,
  // Required, not optional: `remarkHeadingAnchors` emits <HeadingAnchor/> into every
  // heading, and MDX throws at RENDER (not at build) when a referenced component is
  // missing. Found exactly that way.
  HeadingAnchor,
};
