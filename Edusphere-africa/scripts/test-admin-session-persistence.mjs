import assert from "node:assert/strict";
import { readFile, writeFile, unlink } from "node:fs/promises";

const mode = process.argv[2];
const base = process.env.PREVIEW_URL?.replace(/\/$/, "");
const username = process.env.ADMIN_TEST_USERNAME || "admin";
const file = process.env.ADMIN_SESSION_TEST_FILE || "/tmp/edusphere-session-restart.json";
const cookieName = "edusphere_admin_session";
if (!base || !["prepare", "verify"].includes(mode)) {
  throw new Error("Set PREVIEW_URL and use prepare or verify mode.");
}

const headers = { "Content-Type": "application/json", Origin: base, "Sec-Fetch-Site": "same-origin" };

async function assertSession(cookie) {
  const response = await fetch(`${base}/api/admin/session`, { headers: { Cookie: cookie } });
  assert.equal(response.status, 200, "The saved login session must remain valid");
  assert.deepEqual(await response.json(), { ok: true, username });
  const dashboard = await fetch(`${base}/admin`, { headers: { Cookie: cookie }, redirect: "manual" });
  assert.equal(dashboard.status, 200, "The saved session must open the protected dashboard");
  assert.ok((await dashboard.text()).includes("Newsletter subscribers"));
}

if (mode === "prepare") {
  const password = process.env.ADMIN_TEST_PASSWORD;
  if (!password) throw new Error("Set ADMIN_TEST_PASSWORD for prepare mode.");
  const response = await fetch(`${base}/api/admin/login`, {
    method: "POST", headers, body: JSON.stringify({ username, password }),
  });
  assert.equal(response.status, 200, `Login failed with HTTP ${response.status}`);
  assert.equal((await response.json()).ok, true);
  const setCookie = response.headers.getSetCookie().find((cookie) => cookie.startsWith(`${cookieName}=`));
  assert.ok(setCookie, "Login must set the session cookie");
  const cookie = setCookie.split(";")[0];
  assert.match(cookie, /^edusphere_admin_session=[a-f0-9]{64}$/);
  await assertSession(cookie);
  // Test artifact only: never print the cookie or store it in the project.
  await writeFile(file, JSON.stringify({ base, username, cookie }), { mode: 0o600 });
  console.log("PASS: login created a working database session; ready for server rebuild/restart.");
} else {
  const record = JSON.parse(await readFile(file, "utf8"));
  assert.equal(record.base, base, "Do not send the stored cookie to a different origin");
  assert.equal(record.username, username);
  await assertSession(record.cookie);
  console.log("PASS: the same login session survived production rebuild and server restart.");
  const logout = await fetch(`${base}/api/admin/logout`, {
    method: "POST", headers: { ...headers, Cookie: record.cookie }, body: "{}",
  });
  assert.equal(logout.status, 200);
  const replay = await fetch(`${base}/api/admin/session`, { headers: { Cookie: record.cookie } });
  assert.equal(replay.status, 401, "A logged-out cookie must not be replayable");
  const dashboard = await fetch(`${base}/admin`, { headers: { Cookie: record.cookie }, redirect: "manual" });
  assert.equal(dashboard.status, 307);
  await unlink(file);
  console.log("PASS: logout revokes the stored session and rejects replay of its cookie.");
}
