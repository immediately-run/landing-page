import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import { remarkAdmonitions, remarkHeadingAnchors } from '@immediately-run/mdx-plugins'

// MDX must run before @vitejs/plugin-react so the JSX it emits is handled by
// React's transform (Fast Refresh included). immediately.run processes .mdx
// natively; this wiring keeps the local `vite dev`/`build` in sync.
//
// The remark plugins are the SAME package the platform's transpiler uses
// (@immediately-run/mdx-plugins), not lookalikes. That matters for heading
// anchors specifically: every in-page link and every TOC entry is an id derived
// from heading TEXT, so a local build that derived them differently would produce
// a site whose deep links work in `vite dev` and 404 on immediately.run — the
// exact "looks fine locally, breaks on the platform" failure this repo's rules
// exist to prevent. `headingId()` from the same package computes them for the TOC,
// so the two cannot disagree.
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // `remarkFrontmatter` MUST come first. Without it, `@mdx-js/rollup` reads a
    // `---\ntitle: …\n---` block as a thematic break followed by a SETEXT heading, so the
    // whole frontmatter turns into an <h2> at the top of every page — which is what
    // happened, and which nothing but looking at the rendered DOM would have caught (the
    // build was clean). The platform's transpiler strips frontmatter itself; this keeps
    // local `vite dev`/`build` matching it.
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkHeadingAnchors, remarkAdmonitions] }) },
    react(),
  ],
})
