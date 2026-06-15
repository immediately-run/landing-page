// Typed doc content for the /docs section. This is a plain .ts module (NOT a
// component file), so it may export data, types, and helpers freely.
//
// One authored source, two renderings: the human article view and the machine
// surface (llms.txt preview + structured capability index) are both derived
// from the same typed records below — they cannot drift.

/* ----------------------------------------------------------------- types -- */

export interface DocParam {
  name: string;
  type: string;
  desc: string;
}

export interface DocRejection {
  code: string;
  meaning: string;
}

export interface DocApi {
  kind: 'api';
  /** Anchor id; also the TOC entry. */
  id: string;
  /** TOC label for this signature. */
  toc: string;
  sig: string;
  cap: string;
  capHref: string;
  params: DocParam[];
  returns: string;
  rejections: DocRejection[];
}

export interface DocHeading {
  kind: 'h2';
  id: string;
  text: string;
}

export interface DocParagraph {
  kind: 'p';
  text: string;
}

export interface DocCode {
  kind: 'code';
  /** The route/filename header shown above the snippet. */
  route: string;
  code: string;
}

export interface DocCallout {
  kind: 'callout';
  tone: 'note' | 'warning' | 'security';
  title: string;
  text: string;
}

export interface DocExample {
  kind: 'example';
  name: string;
  desc: string;
  presentHref: string;
  editHref: string;
}

export type DocBlock =
  | DocHeading
  | DocParagraph
  | DocCode
  | DocCallout
  | DocExample
  | DocApi;

export interface DocPage {
  group: string;
  slug: string;
  title: string;
  /** One-line description — reused verbatim in the llms.txt index. */
  lead: string;
  blocks: DocBlock[];
}

export interface DocGroup {
  /** Mono uppercase label shown in the sidebar. */
  group: string;
  /** URL segment, e.g. "sdk" → #/docs/sdk/<slug>. */
  key: string;
}

export interface CapEntry {
  name: string;
  desc: string;
  consent: string;
  rejects: string;
}

export interface TocItem {
  id: string;
  label: string;
}

/* -------------------------------------------------------------- helpers -- */

export function pageHref(p: { group: string; slug: string }): string {
  return `#/docs/${p.group}/${p.slug}`;
}

/** The article H2s + API signatures, in document order, as TOC anchors. */
export function tocFor(page: DocPage): TocItem[] {
  const items: TocItem[] = [];
  for (const b of page.blocks) {
    if (b.kind === 'h2') items.push({ id: b.id, label: b.text });
    if (b.kind === 'api') items.push({ id: b.id, label: b.toc });
  }
  return items;
}

export function findPage(group: string, slug: string): DocPage | undefined {
  return DOC_PAGES.find((p) => p.group === group && p.slug === slug);
}

/** Linear prev/next across the whole reading order (sidebar order). */
export function neighbors(page: DocPage): {
  prev?: DocPage;
  next?: DocPage;
} {
  const i = DOC_PAGES.indexOf(page);
  return {
    prev: i > 0 ? DOC_PAGES[i - 1] : undefined,
    next: i >= 0 && i < DOC_PAGES.length - 1 ? DOC_PAGES[i + 1] : undefined,
  };
}

/* ---------------------------------------------------------------- groups -- */

export const DOC_GROUPS: DocGroup[] = [
  { group: 'Getting started', key: 'start' },
  { group: 'SDK', key: 'sdk' },
  { group: 'Capabilities', key: 'capabilities' },
  { group: 'Agents', key: 'agents' },
];

/* ----------------------------------------------------------------- pages -- */
// Reading order is the array order; sidebar groups slice by `group` key.

export const DOC_PAGES: DocPage[] = [
  {
    group: 'start',
    slug: 'overview',
    title: 'Run any app from its source.',
    lead:
      'immediately.run loads a React + TypeScript app straight from a GitHub repo and transpiles it in the browser — no server, no deploy step. Open it, use it, then pop the hood.',
    blocks: [
      {
        kind: 'p',
        text:
          'Every app is a public repo. The platform reads the source, compiles it in a sandboxed iframe, and renders the default export. There is no build artifact to host and nothing to deploy — publishing is pushing to GitHub.',
      },
      {
        kind: 'h2',
        id: 'the-loop',
        text: 'The run, edit, contribute loop.',
      },
      {
        kind: 'p',
        text:
          'Open an app to run it. Fork it to edit it from the page itself. Push your change back and it is live the next time anyone runs it. The same three moves work for every app on the platform, including this documentation.',
      },
      {
        kind: 'example',
        name: 'whiteboard',
        desc: 'A complete app you can open and fork in one click.',
        presentHref:
          '/present/github/immediately-run/whiteboard/main/files/src/App.tsx',
        editHref: '/edit/new',
      },
      {
        kind: 'callout',
        tone: 'note',
        title: 'No runtime build step.',
        text:
          'What looks fine in local vite dev can still break on the platform if the entry rules are not followed. App.tsx is the entry point, and its default export is what renders.',
      },
      {
        kind: 'h2',
        id: 'next',
        text: 'Where to go next.',
      },
      {
        kind: 'p',
        text:
          'Wire up the SDK to talk to the platform, then learn the capability model that governs what your app can ask for. Agents should start at the machine surface.',
      },
    ],
  },
  {
    group: 'sdk',
    slug: 'entry',
    title: 'The SDK entry point.',
    lead:
      'All platform interaction goes through @immediately-run/sdk — the only channel between your sandboxed app and the host. Pin it, import it, and call protocol methods reactively.',
    blocks: [
      {
        kind: 'p',
        text:
          'Your app runs in a sandboxed iframe with an opaque origin. It cannot reach sibling iframes, share storage with other apps, or postMessage the parent on its own. The SDK is the single, audited surface for everything the host provides.',
      },
      {
        kind: 'h2',
        id: 'install',
        text: 'Install and import.',
      },
      {
        kind: 'p',
        text:
          'Add the pinned dependency to package.json and import the functions you need. The version is pinned so the protocol your app speaks is stable across host releases.',
      },
      {
        kind: 'code',
        route: 'src/App.tsx',
        code: `import { getAuthState, invokeTask } from '@immediately-run/sdk';

export default function App() {
  const auth = getAuthState();
  return auth.status === 'signed-in'
    ? <Workspace />
    : <SignedOutHint />;
}`,
      },
      {
        kind: 'callout',
        tone: 'security',
        title: 'Never handle credentials.',
        text:
          'You will never see the user’s GitHub token or any secret. Sign-in and privileged actions are host-driven. Gate calls on getAuthState().status === ’signed-in’; never store or request tokens.',
      },
      {
        kind: 'api',
        id: 'signature',
        toc: 'getAuthState()',
        sig: 'getAuthState(): AuthState',
        cap: 'identity',
        capHref: '#/docs/capabilities/identity',
        params: [],
        returns:
          'An AuthState with status: ’signed-in’ | ’signed-out’ | ’unknown’, plus a stable opaque user handle when signed in. Synchronous; reflects the current host session.',
        rejections: [
          {
            code: 'auth-required',
            meaning: 'A gated method was called while signed out.',
          },
          {
            code: 'forbidden',
            meaning: 'The app lacks the identity capability — policy, not a retry.',
          },
        ],
      },
      {
        kind: 'h2',
        id: 'versioning',
        text: 'Protocol and versioning.',
      },
      {
        kind: 'p',
        text:
          'The SDK major version is the protocol version. The host accepts a range of recent protocols, so a pinned app keeps working as the host advances. New capabilities arrive as additive methods you opt into.',
      },
    ],
  },
  {
    group: 'capabilities',
    slug: 'model',
    title: 'The consent model.',
    lead:
      'Access to data is asked for, not taken. The filesystem you see is the filesystem you got. Every privileged call replies with a typed result, and forbidden means policy — not a bug to retry around.',
    blocks: [
      {
        kind: 'p',
        text:
          'A capability is a narrow, revocable grant: a specific mount, a specific task contract, the identity handle. Your app starts with the mounts the host gave it and asks the user for anything more through host UI you do not draw.',
      },
      {
        kind: 'h2',
        id: 'requesting',
        text: 'Requesting more access.',
      },
      {
        kind: 'p',
        text:
          'Need another space or folder? Call the SDK request method and the user picks in the host’s own picker. Expect cancellation and absence — degrade the feature, do not crash.',
      },
      {
        kind: 'api',
        id: 'signature',
        toc: 'requestFolder()',
        sig: 'requestFolder(opts: { mode: ’ro’ | ’rw’ }): Promise<Result<Mount>>',
        cap: 'filesystem',
        capHref: '#/docs/capabilities/model',
        params: [
          {
            name: 'opts.mode',
            type: '’ro’ | ’rw’',
            desc: 'Whether the app is asking for read-only or read-write access. The user may grant a narrower mode than requested.',
          },
        ],
        returns:
          'A Result<Mount>. On ok, a Mount with a mountId and root you can read and (if rw) write. Outside paths do not exist; .. and absolute escapes are not addressable.',
        rejections: [
          {
            code: 'cancelled',
            meaning: 'The user dismissed the host picker.',
          },
          {
            code: 'forbidden',
            meaning: 'Policy denies this app the filesystem capability.',
          },
          {
            code: 'invalid-params',
            meaning: 'mode was not one of the accepted values.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Writes to a read-only mount fail.',
        text:
          'A grant may be read-only. Writing to it rejects with EROFS. Gate write affordances on the mount mode and re-evaluate on mount changes; never surface EROFS as UX.',
      },
      {
        kind: 'h2',
        id: 'errors',
        text: 'Typed errors everywhere.',
      },
      {
        kind: 'p',
        text:
          'Platform calls reply { ok: false, code, message } with a small, stable set of codes: forbidden, auth-required, cancelled, invalid-params, timeout. Handle each by meaning, not by string-matching the message.',
      },
    ],
  },
  {
    group: 'capabilities',
    slug: 'identity',
    title: 'Identity and sign-in.',
    lead:
      'Identity is a capability like any other. You get a stable, opaque handle for the signed-in user — never a token, never an email, never a secret.',
    blocks: [
      {
        kind: 'p',
        text:
          'Read the session synchronously and react to it. Sign-in is host-driven: render your own affordance that asks the host to start the flow, but never imitate the host’s consent or sign-in chrome — imitations read as spoofing.',
      },
      {
        kind: 'h2',
        id: 'reacting',
        text: 'Reacting to session changes.',
      },
      {
        kind: 'p',
        text:
          'Subscribe to auth changes and re-render. On a fork of your app the identity capability may be absent entirely; treat that as a degraded mode, not an error to retry.',
      },
      {
        kind: 'code',
        route: 'src/hooks/useAuth.ts',
        code: `import { onAuthChange, getAuthState } from '@immediately-run/sdk';

export function useAuth() {
  const [s, set] = useState(getAuthState());
  useEffect(() => onAuthChange(set), []);
  return s;
}`,
      },
      {
        kind: 'callout',
        tone: 'security',
        title: 'No fake host chrome.',
        text:
          'Never render fake sign-in prompts, consent dialogs, or the platform’s seam and header. The host draws those. Your app draws its own content and asks the host to handle privileged UI.',
      },
    ],
  },
];

/* -------------------------------------------------- machine surface data -- */
// The structured capability index — the same facts as the prose, as data an
// agent can read without scraping HTML.

export const CAP_INDEX: CapEntry[] = [
  {
    name: 'identity',
    desc: 'A stable, opaque handle for the signed-in user. No token, no secret.',
    consent: 'host session',
    rejects: 'auth-required · forbidden',
  },
  {
    name: 'filesystem',
    desc: 'Read and (if granted) write the mounts the host gave your app.',
    consent: 'per-mount',
    rejects: 'forbidden · EROFS',
  },
  {
    name: 'request-folder',
    desc: 'Ask the user to grant another folder or space through host UI.',
    consent: 'user picks',
    rejects: 'cancelled · forbidden',
  },
  {
    name: 'invoke-task',
    desc: 'Call a declared cross-app task contract, e.g. edit-file.',
    consent: 'declared',
    rejects: 'forbidden · invalid-params',
  },
  {
    name: 'network',
    desc: 'Fetch from explicitly allowed origins; no ambient cross-app reach.',
    consent: 'per-origin',
    rejects: 'forbidden · timeout',
  },
];

/** The llms.txt index — the same pages, grouped, as a link-rich machine index. */
export interface LlmsGroup {
  tag: string;
  items: { title: string; path: string; desc: string }[];
}

export function llmsGroups(): LlmsGroup[] {
  return DOC_GROUPS.map((g) => ({
    tag: g.group,
    items: DOC_PAGES.filter((p) => p.group === g.key).map((p) => ({
      title: p.title.replace(/\.$/, ''),
      path: `/docs/${g.key}/${p.slug}.md`,
      desc: p.lead,
    })),
  })).filter((g) => g.items.length > 0);
}
