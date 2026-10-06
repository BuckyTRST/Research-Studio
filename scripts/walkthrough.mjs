import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ART = "/opt/cursor/artifacts";
const OUT = "/tmp/pw-demo";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ART, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
page.on("dialog", async (d) => d.accept());

async function shot(name) {
  const p = path.join(ART, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log("shot", p);
}

try {
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await shot("landing_hero.png");

  await page.goto("http://localhost:3000/studio", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Make the next video");
  await page.waitForTimeout(500);
  await shot("studio_dashboard.png");

  await page.goto("http://localhost:3000/studio/niches", { waitUntil: "networkidle" });
  const nicheName = `Bike repair shops ${Date.now().toString().slice(-4)}`;
  await page.fill('input[placeholder="Homesteading beginners"]', nicheName);
  await page.fill('textarea[placeholder="What this niche cares about"]', "Local bike shops teaching maintenance");
  await page.fill('input[placeholder="r/homestead, r/gardening"]', "r/bicycling,r/bikecommuting");
  await page.click('button:has-text("Create niche")');
  await page.waitForSelector(`text=${nicheName}`);
  await page.waitForTimeout(400);
  await shot("niches_created.png");

  const card = page.locator("li", { hasText: nicheName });
  await card.locator('a:has-text("Research →")').click();
  await page.waitForURL(/research/);
  await page.waitForTimeout(400);
  await page.click('button:has-text("Run research")');
  await page.waitForSelector('button:has-text("Draft script")', { timeout: 60000 });
  await page.waitForTimeout(600);
  await shot("research_results.png");

  await page.locator('button:has-text("Draft script")').first().click();
  await page.waitForTimeout(2000);

  await page.goto("http://localhost:3000/studio/scripts", { waitUntil: "networkidle" });
  await page.waitForSelector('button:has-text("Render video")', { timeout: 15000 });
  await page.waitForTimeout(500);
  await shot("scripts_editor.png");

  // Render the newest script card (first in list)
  await page.locator('button:has-text("Render video")').first().click();
  await page.waitForURL(/studio\/review\//, { timeout: 180000 });
  await page.waitForSelector('button:has-text("Post now")');
  await page.waitForTimeout(1000);
  await shot("review_detail.png");

  await page.click('button:has-text("Post now")');
  await page.waitForSelector("text=/Demo post|Posted|local demo|posted/i", { timeout: 30000 });
  await page.waitForTimeout(800);
  await shot("review_posted.png");

  console.log("WALKTHROUGH_OK");
} catch (e) {
  console.error("WALKTHROUGH_FAIL", e);
  await shot("failure_state.png");
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
  const videos = fs.readdirSync(OUT).filter((f) => f.endsWith(".webm"));
  if (videos[0]) {
    const dest = path.join(ART, "studio_end_to_end_walkthrough.webm");
    fs.copyFileSync(path.join(OUT, videos[0]), dest);
    console.log("video", dest);
  }
}
