// Lets TypeScript treat `import Article from './x.mdx'` as a React component.
declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
