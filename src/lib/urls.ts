// External URLs the site links to. Same rule as `routes.ts`, one origin further
// out: a URL that appears twice lives here once and nowhere else, so a moved
// install flow or a renamed reference site is one edit rather than a grep.

/** GitHub's install flow for the immediately.run App — the one prerequisite the
 *  platform cannot perform for a visitor (the footer, /new and the Publish
 *  section all point at it). */
export const GITHUB_APP_INSTALL_URL = 'https://github.com/apps/immediately-run/installations/new';

/** The SDK's API reference: TypeDoc output published to the SDK repo's own Pages
 *  origin on every release. Generated from the published package, so unlike this
 *  site it cannot drift from the code — which is why the site links it instead of
 *  restating signatures. Keeps its trailing slash: it is a site root. */
export const SDK_REFERENCE_URL = 'https://immediately-run.github.io/immediately-run-sdk/';

/** A generated artifact published beside the reference, e.g. `llms.txt`, `api.json`. */
export function sdkReferenceUrl(file: string): string {
  return `${SDK_REFERENCE_URL}${file.replace(/^\/+/, '')}`;
}

/** The SDK's page on npm — the footer's "the SDK is a published package" link. */
export const NPM_SDK_URL = 'https://www.npmjs.com/package/@immediately-run/sdk';

/** The immediately-run org on GitHub — the footer's repository link. */
export const GITHUB_ORG_URL = 'https://github.com/immediately-run';

/** GitHub's template-generate flow for a `owner/repo` template. The /new page's
 *  "start from this template" hand-off; R3-164 replaces it with the host's own flow. */
export function githubGenerateUrl(repo: string): string {
  return `https://github.com/${repo}/generate`;
}
