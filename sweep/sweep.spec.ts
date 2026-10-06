// sweep.spec.ts — R3-747: mobile route sweep over vite preview for landing-page.
//
// Walks every route from sweepRoutes() across 5 viewports:
//   - 390×844 (mobile, touch, DPR 3)
//   - 844×390 (landscape, touch, DPR 3)
//   - 320×568 (small mobile, touch, DPR 3)
//   - 1024×768 (tablet/desktop, DPR 1)
//   - 1280×800 (desktop, DPR 1)

import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  collectLayout,
  judgeLayout,
  judgeOverlay,
} from "@immediately-run/verify-checks/sweep";
import { ratchet } from "@immediately-run/verify-checks/baseline";
import { sweepRoutes } from "../src/lib/sweepRoutes";

const OUT_DIR = path.resolve(process.cwd(), "sweep/.out");

const VIEWPORTS = [
  {
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  },
  {
    width: 844,
    height: 390,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  },
  {
    width: 320,
    height: 568,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  },
  {
    width: 1024,
    height: 768,
    isMobile: false,
    hasTouch: false,
    deviceScaleFactor: 1,
  },
  {
    width: 1280,
    height: 800,
    isMobile: false,
    hasTouch: false,
    deviceScaleFactor: 1,
  },
];

const SWEEP_ALLOWED_ORIGINS = new Set([
  "fonts.googleapis.com",
  "fonts.gstatic.com",
]);

const allFindings: string[] = [];

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

for (const vp of VIEWPORTS) {
  const vpName = `${vp.width}x${vp.height}`;

  test(`sweep viewport ${vpName}`, async ({ browser, baseURL }) => {
    const routes = sweepRoutes();
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });
    const page = await context.newPage();

    // Hermetic: continue same-origin and fonts, abort everything else
    await page.route("**/*", (route) => {
      try {
        const u = new URL(route.request().url());
        if (u.origin === baseURL || SWEEP_ALLOWED_ORIGINS.has(u.hostname)) {
          return route.continue();
        }
      } catch {
        /* ignore invalid URLs */
      }
      return route.abort();
    });

    for (const r of routes) {
      const url = `${baseURL}${r.path}`;
      const slug =
        r.path.replace(/^\/+|\/+$/g, "").replace(/[/\\?%*:|"<>]/g, "_") ||
        "root";

      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page
        .waitForLoadState("networkidle", { timeout: 1000 })
        .catch(() => {});
      await page.waitForTimeout(200);

      // Screenshot main view
      const screenshotPath = path.join(OUT_DIR, `${slug}_${vpName}.png`);
      await page.screenshot({ path: screenshotPath });

      // Collect layout
      const snapshot = await page.evaluate(collectLayout, {
        controls:
          ":is(header, nav, main, footer) :is(a[href], button, input, [role=button])",
        overlays: '[role="dialog"]',
      });

      const layoutFindings = judgeLayout(snapshot, {
        route: r.path,
        viewport: vpName,
        minTarget: vp.isMobile ? 44 : 24,
      });
      allFindings.push(...layoutFindings);

      // Open overlays by their triggers
      const triggers = await page.$$(
        ".burger, .nav-search-btn, .apps-filters-btn",
      );

      for (const trigger of triggers) {
        if (!(await trigger.isVisible().catch(() => false))) continue;

        const triggerId = await trigger.evaluate((el) => {
          const override = el.getAttribute("data-sweep-id");
          if (override) return override;
          const ariaLabel = el.getAttribute("aria-label");
          if (ariaLabel) return ariaLabel;
          const testid = el.getAttribute("data-testid");
          if (testid) return testid;
          const tag = el.tagName.toLowerCase();
          const firstClass =
            (el.getAttribute("class") || "").trim().split(/\s+/)[0] || "";
          const text = (el.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 24);
          return (
            tag +
            (firstClass ? "." + firstClass : "") +
            (text ? ' "' + text + '"' : "")
          );
        });

        const triggerSlug = triggerId
          .replace(/[/\\?%*:|"<>]/g, "_")
          .slice(0, 32);

        // Open trigger with real click (discriminating mobile layout pointer interception)
        try {
          await trigger.click({ timeout: 1000 });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("intercepts pointer events")) {
            await trigger.click({ force: true, timeout: 5000 });
          } else {
            throw err;
          }
        }
        await page.waitForTimeout(200);

        // Screenshot open menu
        const menuScreenshotPath = path.join(
          OUT_DIR,
          `${slug}_${vpName}_menu_${triggerSlug}.png`,
        );
        await page.screenshot({ path: menuScreenshotPath });

        const overlaySnapshot = await page.evaluate(collectLayout, {
          controls: null,
          overlays: '[role="dialog"]',
        });

        const overlayFindings = judgeOverlay(overlaySnapshot, {
          route: r.path,
          viewport: vpName,
          trigger: triggerId,
          gutter: 8,
        });
        allFindings.push(...overlayFindings);

        // Press Escape
        await page.keyboard.press("Escape");
        await page.waitForTimeout(100);
      }
    }

    await context.close();
  });
}

test.afterAll(async () => {
  const initialExitCode = process.exitCode;
  const argv =
    process.env.WRITE_BASELINE === "1" ? ["--write-baseline"] : process.argv;
  await ratchet({
    check: "sweep",
    findings: allFindings,
    baselinePath: "verify-baselines/sweep.json",
    cwd: process.cwd(),
    argv,
  });
  if (initialExitCode !== undefined && initialExitCode !== 0) {
    process.exitCode = initialExitCode;
  }
  expect(process.exitCode ?? 0).toBe(0);
});
