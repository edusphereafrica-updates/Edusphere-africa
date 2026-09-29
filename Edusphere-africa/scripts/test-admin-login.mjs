import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const base = process.env.PREVIEW_URL;
const password = process.env.ADMIN_TEST_PASSWORD;
if (!base || !password) throw new Error("Set PREVIEW_URL and ADMIN_TEST_PASSWORD.");
const username = process.env.ADMIN_TEST_USERNAME || "admin";

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--test-third-party-cookie-phaseout"],
});

/**
 * Reproduces the arena.ai preview: a cross-site iframe whose proxy deletes
 * Set-Cookie and strips every custom request header, plus a sandbox that
 * blocks browser storage. This is the case the old build failed with
 * "We couldn't confirm your session (HTTP 401)".
 */
async function hostileProxy(context, page) {
  await page.route(
    /\/api\/admin\/(login|forgot|reset|t\/)/,
    async (route) => {
      const headers = { ...route.request().headers() };
      for (const key of Object.keys(headers)) {
        const keep =
          key === "content-type" || key === "accept" || key.startsWith("sec-") || key === "user-agent";
        if (!keep) delete headers[key]; // custom headers are stripped
      }
      const response = await route.fetch({ headers });
      const out = { ...response.headers() };
      delete out["set-cookie"]; // cookies never persist
      await route.fulfill({ response, headers: out });
    },
  );
  await page.addInitScript(() => {
    const boom = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
    const blocked = {
      get length() {
        boom();
        return 0;
      },
      key: boom,
      getItem: boom,
      setItem: boom,
      removeItem: boom,
      clear: boom,
    };
    Object.defineProperty(window, "sessionStorage", { configurable: true, get: () => blocked });
    Object.defineProperty(window, "localStorage", { configurable: true, get: () => blocked });
  });
}

async function assertSignedIn(scope) {
  await expect(scope.getByRole("heading", { name: `Welcome back, ${username}.` })).toBeVisible({
    timeout: 25000,
  });
  await expect(scope.getByRole("heading", { name: "Newsletter subscribers", exact: true })).toBeVisible();
}

try {
  for (const scenario of [
    { name: "Desktop tab", embedded: false, hostile: false, mobile: false },
    { name: "arena preview iframe (hostile proxy + blocked storage)", embedded: true, hostile: true, mobile: false },
    { name: "Mobile arena preview iframe", embedded: true, hostile: true, mobile: true },
  ]) {
    const context = await browser.newContext({
      viewport: scenario.mobile ? { width: 390, height: 844 } : { width: 1366, height: 1000 },
      isMobile: scenario.mobile,
      hasTouch: scenario.mobile,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (scenario.hostile) await hostileProxy(context, page);

    let scope;
    if (scenario.embedded) {
      await page.route("https://preview-harness.example/**", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><iframe name="edusphere" title="Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" src="${base}/admin/login" style="border:0;width:100%;height:100vh"></iframe></body></html>`,
        }),
      );
      await page.goto("https://preview-harness.example/", { waitUntil: "domcontentloaded" });
      scope = page.frameLocator("iframe");
    } else {
      await page.goto(base + "/admin/login", { waitUntil: "domcontentloaded" });
      scope = page;
      // Wrong password must fail cleanly and re-enable the form.
      await scope.getByLabel("Password", { exact: true }).fill("deliberately-wrong-password");
      await scope.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(scope.locator("#admin-login-error")).toContainText("Incorrect username or password");
      await expect(scope.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
    }

    await scope.getByLabel("Username", { exact: true }).fill(` ${username.toUpperCase()} `);
    await scope.getByLabel("Password", { exact: true }).fill(password);
    await scope.getByRole("button", { name: "Sign in", exact: true }).click();

    // The exact regression: this text must never appear.
    await assertSignedIn(scope);
    const bodyText = await (scenario.embedded
      ? page.frame({ name: "edusphere" }).locator("body").innerText()
      : page.locator("body").innerText());
    assert.ok(
      !/couldn't confirm your session/i.test(bodyText),
      "must never show the stale 'couldn't confirm your session' error",
    );

    // Survives a reload via the path token.
    const frame = scenario.embedded ? page.frame({ name: "edusphere" }) : page.mainFrame();
    await frame.goto(frame.url(), { waitUntil: "domcontentloaded" });
    await assertSignedIn(scope);

    // Publish form reachable (token-authorized endpoint).
    await scope.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(scope.getByRole("heading", { name: "Publish a new opportunity" })).toBeVisible();

    // Sign out locks the desk.
    await scope.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(scope.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible({ timeout: 15000 });

    assert.deepEqual(errors, [], "No browser runtime errors");
    console.log(`PASS: ${scenario.name}`);
    await context.close();
  }
} finally {
  await browser.close();
}
