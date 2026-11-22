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
// A normal phone browser user agent: the visit counter ignores headless browsers and bots.
const UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";
async function newPage(opts = {}, cookies = []) {
  const ctx = await browser.newContext({ userAgent: UA, ...opts });
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
  ok(await w.locator("section.gallery").count() === 1, "photos and videos section on the home page");
  ok(await w.locator(".hero details.more, .hero .res").count() === 0, "no labour details on the home page itself");
  ok(await w.locator(".starter-head").count() === 9, "nine options, salary and end of service merged");
  for (const k of ["accident", "property"]) ok(await w.locator(`.starter-head[data-type="${k}"]`).count() === 0, `no ${k} option`);
  ok(await w.locator('.starter-head[data-type="translation"]').textContent().then((x) => x.includes("সত্যায়ন")), "translation option includes attestation");
  for (const k of ["poa", "invest"]) ok(await w.locator(`.starter-head[data-type="${k}"]`).count() === 1, `${k} option`);
  ok(await w.locator('.starter-head[data-type="commercial"]').count() === 1 && await w.locator('.starter-head[data-type="general"]').count() === 1, "commercial and general options");
  await w.click('.starter-head[data-type="labour"]');
  ok(await w.locator("#case-labour details.more").count() === 1, "labour details are inside the labour option");
  ok(!(await w.locator("#case-labour details.more .res").first().isVisible()), "and folded away");
  await w.click('.starter-head[data-type="hajj"]');
  ok(await seen(w, "#case-hajj .res >> text=নুসুক"), "Hajj and Umrah option explains itself");
  // The "Huquqi" name opens the site menu; the contact and feedback forms reach the admin.
  await w.click("button.brand");
  ok(await w.locator("#site-menu a").count() === 9, "brand menu lists contact, feedback, partners, about and more");
  await w.click('#site-menu a[href="/feedback"]');
  await w.waitForURL("**/feedback");
  ok(await w.locator("#site-menu").waitFor({ state: "detached", timeout: 5000 }).then(() => true, () => false), "menu closes after choosing");
  const complaint = `Slow reply test ${Date.now()}`;
  await w.click('label.chip:has(input[value="complaint"])');
  await w.fill("#c-name", "Rahim");
  await w.fill("#c-email", `rahim${Date.now()}@example.com`);
  await w.fill("#c-body", complaint);
  await w.click("form:has(#c-body) button.btn");
  ok(await seen(w, ".okmsg"), "complaint sent");
  for (const p of ["/contact", "/partners", "/about", "/how", "/faq", "/join", "/privacy"]) {
    ok((await w.goto(BASE + p)).status() === 200 && (await w.locator("h1").count()) === 1, `${p} page loads`);
  }

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

  // Visitor on the home page: picking an option opens the three empty boxes under it.
  const v = await (await newPage()).newPage();
  await v.goto(BASE + "/");
  await v.click('.starter-head[data-type="bank"]');
  ok(await v.locator("#case-bank textarea, #case-bank input[type=file]").count() === 3, "option opens three boxes: facts, requests, documents");
  ok(await v.locator("#case-bank #description").inputValue() === "", "boxes start empty");
  await v.close();

  await w.goto(BASE + "/cases/new");
  await w.click('.starter-head[data-type="labour"]');
  const exit = new Date(); exit.setMonth(exit.getMonth() - 2);
  await w.fill("#exitDate", exit.toISOString().slice(0, 10));
  ok(await w.locator("#case-labour textarea, #case-labour input[type=file]").count() === 3, "three boxes: facts, requests, documents");
  await w.fill("#description", "আমার খিদমার টাকা পাইনি। test");
  await w.fill("#requests", "খিদমার টাকা আদায় করুন।");
  const f = path.join(tmpdir(), "hq-test.pdf");
  writeFileSync(f, "%PDF-1.4\n%test\n");
  const big = path.join(tmpdir(), "hq-big.pdf");
  writeFileSync(big, Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(15 * 1024 * 1024, 32)]));
  await w.setInputFiles("#files", [f, big]);
  await w.click("#case-labour button.btn");
  await w.waitForURL(/\/cases\/[^/]+\?created=1/, { timeout: 60000 });
  const caseUrl = w.url().split("?")[0];
  const ref = (await w.locator("p.num").first().textContent()).match(/HQ-[A-Z0-9]+/)[0];
  ok(await w.locator(".okmsg").isVisible(), "case created");
  ok(await seen(w, "text=খিদমার টাকা আদায় করুন।"), "requests shown on case");
  ok(await w.locator('a.item[href^="/api/documents/"]').count() === 2, "documents uploaded with the case, incl. a 15 MB file");
  ok(!(await w.locator(".track").count()), "no stage tracking");
  ok(await w.locator("details.more .res.alert").count() === 1, "deadline on the case is inside the labour details");

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

  // A visitor fills an option, logs in, and comes back with the text still there.
  const vis = await (await newPage()).newPage();
  await vis.goto(BASE + "/");
  await vis.click('.starter-head[data-type="hajj"]');
  await vis.fill("#description", "Umrah visa refused. test draft");
  await vis.fill("#requests", "Check for an entry ban.");
  await vis.click("#case-hajj button.btn");
  await vis.waitForURL("**/login?next=/cases/new");
  await vis.fill("#email", "visitor@huquqi.test");
  await vis.click('button[value="send"]');
  await seen(vis, ".devcode");
  await vis.fill("#code", (await vis.locator(".devcode").textContent()).match(/\d{6}/)[0]);
  await vis.click('button[value="verify"]');
  await vis.waitForURL("**/cases/new");
  ok(await seen(vis, "#case-hajj #description"), "after login the same option is open");
  ok(await vis.locator("#case-hajj #description").inputValue() === "Umrah visa refused. test draft", "what the visitor typed is kept");

  // Verified lawyer in Arabic takes the case, posts an update and closes it.
  const lctx = await newPage({ viewport: { width: 1200, height: 900 } }, [{ name: "hq_locale", value: "ar", url: BASE }]);
  const l = await lctx.newPage();
  await login(l, "lawyer@huquqi.test");
  await l.waitForURL("**/lawyer");
  ok((await l.locator("html").getAttribute("dir")) === "rtl", "Arabic is right-to-left");
  await l.goto(BASE + "/inbox");
  ok(await seen(l, `tr.awaiting:has-text("${ref}") .pill.new`), "new case shows in the inbox as awaiting a reply");
  await l.goto(caseUrl);
  await l.click("text=استلم القضية");
  await l.waitForURL(caseUrl);
  await l.fill("#msg-body", "استلمت المستندات، سأجهز الوكالة.");
  await l.click('form:has(#msg-body) button');
  await l.waitForSelector("text=استلمت المستندات");
  ok(await l.locator(".pill:not(.closed)").count() === 1, "case is open and no longer awaiting a reply");
  const note = `Internal note ${Date.now()}`;
  await l.fill("#note-body", note);
  await l.click('form:has(#note-body) button');
  ok(await seen(l, `.note >> text=${note}`), "lawyer added an internal note");
  await l.fill("#msg-body", "تم صرف المكافأة.");
  await l.check("#msg-close");
  await l.click('form:has(#msg-body) button');
  ok(await seen(l, ".pill.closed"), "lawyer closed the case");
  if (SHOTS) await l.screenshot({ path: path.join(SHOTS, "lawyer-case.png"), fullPage: true });

  // Worker sees the update.
  await w.goto(caseUrl);
  ok(await seen(w, "text=استلمت المستندات"), "worker sees lawyer update");
  ok(!(await w.locator(`text=${note}`).count()) && !(await w.locator("#note-body").count()), "client cannot see internal notes");
  await w.fill("#msg-body", "ধন্যবাদ, আরও কাগজ পাঠাচ্ছি। test shit কুত্তা");
  await w.click('form:has(#msg-body) button');
  await w.waitForSelector("text=আরও কাগজ পাঠাচ্ছি");
  const msgText = await w.locator(".update", { hasText: "আরও কাগজ পাঠাচ্ছি" }).textContent();
  ok(msgText.includes("test *** ***") && !msgText.includes("shit") && !msgText.includes("কুত্তা"), "obscene words are masked automatically");

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
  // Admins log in with their mobile number; other numbers are refused.
  await a.goto(BASE + "/login");
  await a.click('button[value="use-phone"]');
  await a.fill("#phone", "01811-222333");
  await a.click('button[value="send"]');
  ok(await seen(a, ".err"), "non-admin phone refused");
  await a.fill("#phone", "01700-000000");
  await a.click('button[value="send"]');
  await seen(a, ".devcode");
  await a.fill("#code", (await a.locator(".devcode").textContent()).match(/\d{6}/)[0]);
  await a.click('button[value="verify"]');
  await a.waitForURL("**/admin");
  ok(true, "admin logged in by phone");
  ok(await seen(a, `td >> text=${complaint}`), "admin sees the complaint");

  // Admin adds a photo and a video; they show at the bottom of the home page.
  const png = path.join(tmpdir(), "hq-photo.png");
  writeFileSync(png, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
  const vid = path.join(tmpdir(), "hq-clip.webm");
  writeFileSync(vid, Buffer.alloc(4096, 1));
  const cap = `Gallery test ${Date.now()}`;
  await a.goto(BASE + "/");
  ok(await seen(a, "section.gallery #media-file"), "admin can upload right on the home page");
  await a.setInputFiles("#media-file", [png, vid]);
  await a.fill("#media-caption", cap);
  await a.click("form:has(#media-file) button");
  await a.waitForFunction((c) => [...document.querySelectorAll(".gallery-grid p")].filter((p) => p.textContent === c).length === 2, cap);
  ok(true, "admin uploaded a photo and a video");
  const anonHome = await (await newPage()).newPage();
  await anonHome.goto(BASE + "/");
  ok(await seen(anonHome, `.gallery >> text=${cap}`), "photos and videos show on the home page");
  ok(await anonHome.locator(".gallery video").count() >= 1, "video player on the home page");
  const vsrc = await anonHome.locator(".gallery video").first().getAttribute("src");
  const part = await anonHome.request.get(BASE + vsrc, { headers: { Range: "bytes=0-99" } });
  ok(part.status() === 206 && (await part.body()).length === 100, "video supports seeking (range requests)");
  await a.goto(BASE + "/admin");
  ok(await a.locator("table").first().isVisible(), "admin dashboard loads");
  const digits = (x) => x.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^0-9]/g, "");
  const totalVisitors = Number(digits(await a.locator(".visits .stat b").last().textContent()));
  ok(await a.locator(".visits .bar").count() === 14 && totalVisitors > 0, "visitor counts show on the admin page");
  await a.goto(BASE + `/inbox?awaiting=1&q=${ref}`);
  ok(await a.locator("tbody tr").count() === 1 && await seen(a, `tr.awaiting:has-text("${ref}")`), "client reply puts the case back as awaiting; search by number works");
  await a.goto(BASE + "/inbox?type=hajj&q=" + ref);
  ok(await seen(a, "tbody td.muted"), "type filter narrows the list");
  await a.goto(BASE + "/admin");
  await a.waitForLoadState("networkidle");
  await a.click(`tr:has-text("${reviewText}") button >> nth=0`);
  await a.locator(`tr:has-text("${reviewText}") button.ghost`).waitFor({ timeout: 10000 });
  await w.goto(BASE + "/");
  ok(await seen(w, `.reviews >> text=${reviewText}`), "approved review shows on the home page");
  await w.goto(BASE + "/admin");
  ok(w.url().endsWith("/forbidden"), "worker is kept out of admin");
  console.log("\nAll checks passed");
} finally {
  await browser.close();
}
