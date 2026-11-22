// End-to-end smoke test. Needs a running server with DEV_SHOW_OTP=1 and the seed data.
//   BASE_URL=http://localhost:3000 node e2e/smoke.mjs
import { createRequire } from "node:module";
// Playwright is not a dependency of the app; use a global install (NODE_PATH=$(npm root -g)).
const { chromium } = createRequire(import.meta.url)("playwright");
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR;
const seen = (page, sel) => page.locator(sel).first().waitFor({ timeout: 10000 }).then(() => true, () => false);
const browser = await chromium.launch();
const ok = (c, m) => { if (!c) throw new Error("FAIL: " + m); console.log("✓", m); };

// On a password-protected demo deployment, pass DEMO_PASSWORD to get past the gate.
async function newPage(opts = {}, cookies = []) {
  const ctx = await browser.newContext(opts);
  if (process.env.DEMO_PASSWORD) {
    const p = await ctx.newPage();
    await p.goto(BASE + "/demo");
    await p.fill("#password", process.env.DEMO_PASSWORD);
    await p.click("form:has(#password) button");
    await p.waitForURL(BASE + "/");
    await p.close();
  }
  if (cookies.length) await ctx.addCookies(cookies);
  return ctx;
}

async function login(page, email, name) {
  await page.goto(BASE + "/login");
  await page.fill("#email", email);
  await page.click('button[value="send"]');
  await seen(page, ".devcode");
  const dev = await page.locator(".devcode").textContent();
  const code = dev.match(/\d{6}/)[0];
  await page.fill("#code", code);
  if (name) await page.fill("#name", name);
  await page.click('button[value="verify"]');
  await page.waitForLoadState("networkidle");
}

try {
  // Worker in Bengali: wrong code is rejected, then logs in and opens a case.
  const w = await (await newPage({ viewport: { width: 400, height: 860 } })).newPage();
  await w.goto(BASE + "/");
  ok((await w.locator("html").getAttribute("lang")) === "bn", "default language is Bengali");
  ok(await w.locator(".marks li").count() === 3, "home shows scales, gavel and flag");
  ok(await w.locator("details.more .res.alert").count() === 1, "labour deadline is inside the labour details");
  ok(!(await w.locator("details.more .res.alert").isVisible()), "labour details are folded away");
  await w.click('label.chip:has-text("উমরাহ")');
  ok(await seen(w, ".res >> text=নুসুক"), "Hajj and Umrah option in case check");
  await w.goto(BASE + "/login");
  await w.fill("#email", "not-an-email");
  await w.click('button[value="send"]');
  ok(await seen(w, ".err"), "invalid email rejected");
  await w.fill("#email", "Rahim.Test@Example.com");
  await w.click('button[value="send"]');
  await seen(w, "#code");
  await w.fill("#code", "000000");
  await w.click('button[value="verify"]');
  ok(await seen(w, ".err"), "wrong code rejected");
  const code = (await w.locator(".devcode").textContent()).match(/\d{6}/)[0];
  await w.fill("#code", code);
  await w.fill("#name", "Rahim Test");
  await w.click('button[value="verify"]');
  await w.waitForURL("**/cases");
  ok(true, "worker logged in");
  if (SHOTS) await w.screenshot({ path: path.join(SHOTS, "worker-cases.png") });

  await w.goto(BASE + "/cases/new");
  await w.click('label.chip:has(input[value="eosb"])');
  await w.fill("#employer", "Test Co");
  const exit = new Date(); exit.setMonth(exit.getMonth() - 2);
  await w.fill("#exitDate", exit.toISOString().slice(0, 10));
  ok(await w.locator(".box3 textarea, .box3 input[type=file]").count() === 3, "three boxes: facts, requests, documents");
  await w.fill("#description", "আমার খিদমার টাকা পাইনি। test");
  await w.fill("#requests", "খিদমার টাকা আদায় করুন।");
  const f = path.join(tmpdir(), "hq-test.pdf");
  writeFileSync(f, "%PDF-1.4\n%test\n");
  const big = path.join(tmpdir(), "hq-big.pdf");
  writeFileSync(big, Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(15 * 1024 * 1024, 32)]));
  await w.setInputFiles("#files", [f, big]);
  await w.click("form button.btn");
  await w.waitForURL(/\/cases\/[^/]+\?created=1/, { timeout: 60000 });
  const caseUrl = w.url().split("?")[0];
  ok(await w.locator(".okmsg").isVisible(), "case created");
  ok(await seen(w, "text=খিদমার টাকা আদায় করুন।"), "requests shown on case");
  ok(await w.locator('a.item[href^="/api/documents/"]').count() === 2, "documents uploaded with the case, incl. a 15 MB file");
  ok(!(await w.locator(".track").count()), "no stage tracking");
  ok(await w.locator("details.more .res.alert").count() === 1, "deadline is inside the labour details");

  await w.setInputFiles("#doc-file", f);
  await w.click('form:has(#doc-file) button');
  await w.waitForFunction(() => document.querySelectorAll('a.item[href^="/api/documents/"]').length === 3);
  ok(true, "another document uploaded from the case page");
  const docHref = await w.locator('a.item[href^="/api/documents/"]').first().getAttribute("href");
  ok((await w.request.get(BASE + docHref)).status() === 200, "owner can download document");
  if (SHOTS) await w.screenshot({ path: path.join(SHOTS, "worker-case.png"), fullPage: true });

  // Anonymous and another worker cannot read the document or case.
  const anon = await newPage();
  ok((await anon.request.get(BASE + docHref)).status() === 401, "anonymous cannot download");
  const other = await (await newPage()).newPage();
  await login(other, "other@huquqi.test", "Other");
  ok((await other.request.get(BASE + docHref)).status() === 404, "other worker cannot download");
  const r = await other.goto(caseUrl);
  ok(r.status() === 404, "other worker cannot open case");

  // Verified lawyer in Arabic takes the case, posts an update and closes it.
  const lctx = await newPage({ viewport: { width: 1200, height: 900 } }, [{ name: "hq_locale", value: "ar", url: BASE }]);
  const l = await lctx.newPage();
  await login(l, "lawyer@huquqi.test");
  await l.waitForURL("**/lawyer");
  ok((await l.locator("html").getAttribute("dir")) === "rtl", "Arabic is right-to-left");
  await l.goto(caseUrl);
  await l.click("text=استلم القضية");
  await l.waitForURL(caseUrl);
  await l.fill("#msg-body", "استلمت المستندات، سأجهز الوكالة.");
  await l.click('form:has(#msg-body) button');
  await l.waitForSelector("text=استلمت المستندات");
  ok(await l.locator(".pill:not(.closed)").count() === 1, "case is open");
  await l.fill("#msg-body", "تم صرف المكافأة.");
  await l.check("#msg-close");
  await l.click('form:has(#msg-body) button');
  ok(await seen(l, ".pill.closed"), "lawyer closed the case");
  if (SHOTS) await l.screenshot({ path: path.join(SHOTS, "lawyer-case.png"), fullPage: true });

  // Worker sees the update.
  await w.goto(caseUrl);
  ok(await seen(w, "text=استلمت المستندات"), "worker sees lawyer update");

  // Worker rates the lawyer; the review waits for admin approval.
  await w.click(".star-input label:nth-child(5)");
  const reviewText = `খুব ভালো উকিল ${Date.now()}`;
  await w.fill("#review-comment", reviewText);
  await w.click('form:has(#review-comment) button');
  ok(await seen(w, ".okmsg >> nth=-1"), "review submitted");
  await w.goto(BASE + "/");
  ok(!(await w.locator(`text=${reviewText}`).count()), "review hidden until approved");

  // Admin page loads for admin and is forbidden for worker.
  const a = await (await newPage()).newPage();
  await login(a, "admin@huquqi.test");
  await a.waitForURL("**/admin");
  ok(await a.locator("table").first().isVisible(), "admin dashboard loads");
  await a.click(`tr:has-text("${reviewText}") button >> nth=0`);
  await a.waitForLoadState("networkidle");
  await w.goto(BASE + "/");
  ok(await seen(w, `.reviews >> text=${reviewText}`), "approved review shows on the home page");
  await w.goto(BASE + "/admin");
  ok(w.url().endsWith("/forbidden"), "worker is kept out of admin");
  console.log("\nAll checks passed");
} finally {
  await browser.close();
}
