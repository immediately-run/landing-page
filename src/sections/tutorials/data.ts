// Typed tutorial content for the /tutorials section. This is a data module, not a
// component file — it exports records and types only. Deep-link routes are data,
// not buried in prose, so they stay agent-writable and easy to verify.

export interface TutorialStep {
  id: string;
  title: string;
  prose: string;
  /** Optional fenced code / route block with a mono filename header. */
  code?: { filename: string; src: string };
  /** Optional "you should now see…" checkpoint with stripe-art placeholder. */
  check?: { text: string; alt: string };
  /** Optional deep link that opens the live platform pre-loaded to this state. */
  deep?: { label: string; href: string };
}

export interface Tutorial {
  slug: string;
  num: string;
  pillar: string;
  title: string;
  /** One-line outcome — what you'll have built. */
  outcome: string;
  prereqs: string;
  time: string;
  difficulty: string;
  tags: string[];
  steps: TutorialStep[];
  /** Where "learn next" points. */
  next: { slug: string; label: string };
}

export const TUTORIALS: Tutorial[] = [
  {
    slug: 'your-first-app',
    num: '01',
    pillar: 'PUBLISHING',
    title: 'Publish an app by pushing a repo.',
    outcome: 'A live app, running from your GitHub repo. No deploy step.',
    prereqs: 'A GitHub account and a repo you can push to.',
    time: '8 min',
    difficulty: 'Beginner',
    tags: ['publishing', 'github', 'no-deploy'],
    steps: [
      {
        id: 'scaffold',
        title: 'Start from the template.',
        prose:
          'An app is a React and TypeScript repo with src/App.tsx as the entry point. Fork the template, or open a fresh one in the editor — the platform transpiles in the browser, so there is nothing to build.',
        deep: { label: 'Open a new app in the editor →', href: '/edit/new' },
      },
      {
        id: 'edit',
        title: 'Make it yours in App.tsx.',
        prose:
          'The default export of src/App.tsx is what the platform renders. Edit it, import your global CSS from here, and keep one component per file. That is the whole contract.',
        code: {
          filename: 'src/App.tsx',
          src: "import './index.css';\n\nexport default function App() {\n  return <h1>Hello from my first app.</h1>;\n}",
        },
        check: {
          text: 'Your headline renders in the preview pane, restyled in the brand canvas.',
          alt: 'editor with App.tsx open beside a live preview',
        },
      },
      {
        id: 'push',
        title: 'Push to GitHub.',
        prose:
          'Commit and push to main. Publishing is the push — there is no separate deploy, no pipeline to wait on. The platform loads the app straight from the repo on its next launch.',
        code: {
          filename: 'terminal',
          src: 'git add -A\ngit commit -m "my first app"\ngit push origin main',
        },
      },
      {
        id: 'run',
        title: 'Run it live.',
        prose:
          'Open the present route for your repo, branch, and entry file. Share that URL and anyone can run your app from source — the same way every app on the platform runs.',
        deep: {
          label: 'Open this app in immediately.run →',
          href: '/present/github/immediately-run/whiteboard/main/files/src/App.tsx',
        },
        check: {
          text: 'Your app, running full-screen from its repo at the present route.',
          alt: 'a published app running full-screen',
        },
      },
    ],
    next: { slug: 'local-claude-code', label: 'Change an app by asking a coding agent.' },
  },
  {
    slug: 'local-claude-code',
    num: '02',
    pillar: 'AGENTS',
    title: 'Change an app by asking a coding agent.',
    outcome: 'An app feature written by a local coding agent, then run from source.',
    prereqs: 'An app repo cloned locally and a coding agent installed.',
    time: '12 min',
    difficulty: 'Intermediate',
    tags: ['agents', 'local-dev', 'forking'],
    steps: [
      {
        id: 'clone',
        title: 'Clone an app you want to change.',
        prose:
          'Agents are first-class authors here, because apps are plain files. Clone the repo locally so the agent has the real tree to work in — no special format, just React and TypeScript.',
        code: {
          filename: 'terminal',
          src: 'git clone https://github.com/immediately-run/whiteboard\ncd whiteboard',
        },
      },
      {
        id: 'ask',
        title: 'Ask the agent for the change.',
        prose:
          'Run your coding agent in the repo and describe the change in plain language. It reads the existing components, follows the one-component-per-file rule, and writes the files. You review the diff.',
        code: {
          filename: 'terminal',
          src: 'claude "add a color picker to the toolbar that\\n  sets the active stroke colour"',
        },
        check: {
          text: 'A diff touching the toolbar component and its CSS, ready to review.',
          alt: 'a coding agent proposing a diff in the terminal',
        },
      },
      {
        id: 'run-local',
        title: 'Run it against your working tree.',
        prose:
          'Start the local dev server and the platform renders the app from your files. Iterate with the agent until the feature does what you meant — the loop is read, ask, run.',
        code: { filename: 'terminal', src: 'npm install\nnpm run dev' },
      },
      {
        id: 'publish',
        title: 'Push the agent’s work.',
        prose:
          'Once it is right, commit and push. The change is live from source on the next launch — the agent wrote it, you shipped it, and the whole thing stays a hackable repo.',
        deep: {
          label: 'Open the edited file in immediately.run →',
          href: '/edit/github/immediately-run/whiteboard/main/files/src/App.tsx',
        },
      },
    ],
    next: { slug: 'bind-a-space', label: 'Give a fork a folder to work in.' },
  },
  {
    slug: 'bind-a-space',
    num: '03',
    pillar: 'SPACES',
    title: 'Give a fork a folder to work in.',
    outcome: 'A forked app bound to a folder it can read and write, by your consent.',
    prereqs: 'A fork of an app and a space or folder to bind it to.',
    time: '10 min',
    difficulty: 'Intermediate',
    tags: ['spaces', 'capabilities', 'consent'],
    steps: [
      {
        id: 'fork',
        title: 'Fork the app.',
        prose:
          'Open the app in the editor to fork it. A fork is yours to change, but it starts with no access to your data — capabilities are granted, never assumed.',
        deep: {
          label: 'Fork this app in the editor →',
          href: '/edit/github/immediately-run/file-selector/main/files/src/App.tsx',
        },
      },
      {
        id: 'request',
        title: 'Request a folder.',
        prose:
          'The app asks for access through the SDK. It does not reach for a path — it calls the request method and the host hands control to you. Your code handles cancelled and forbidden gracefully.',
        code: {
          filename: 'src/lib/grant.ts',
          src: "import { requestFolder } from '@immediately-run/sdk';\n\nconst res = await requestFolder({ mode: 'rw' });\nif (!res.ok) return; // cancelled or forbidden",
        },
      },
      {
        id: 'consent',
        title: 'Grant access in the host prompt.',
        prose:
          'The platform draws the consent prompt — the app never imitates it. You pick the folder and the role: reader, writer, or owner. Access is asked for, not taken.',
        check: {
          text: 'The host consent prompt, asking you to pick a folder and a role.',
          alt: 'host consent prompt for a folder grant',
        },
      },
      {
        id: 'use',
        title: 'Read and write through the mount.',
        prose:
          'The granted folder is now a mount in the app’s world. It reads and writes within that one mount and nowhere else — a read-only grant fails writes with EROFS, which the app degrades around.',
        deep: {
          label: 'Open the bound fork in immediately.run →',
          href: '/present/github/immediately-run/file-selector/main/files/src/App.tsx',
        },
      },
    ],
    next: { slug: 'your-first-app', label: 'Publish an app by pushing a repo.' },
  },
];

export function findTutorial(slug: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.slug === slug);
}
