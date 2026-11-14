import { chromium, expect } from '@playwright/test';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Record only the local, tracking-free build. Never use a shared browser profile.
const output = path.resolve('docs/media');
await mkdir(output, { recursive: true });
const scratch = await mkdtemp(path.join(tmpdir(), 'sprint-recording-'));
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  recordVideo: { dir: scratch, size: { width: 1280, height: 900 } },
  colorScheme: 'dark',
  timezoneId: 'UTC',
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const video = page.video();
const timings = [];
let started;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function point(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const box = await locator.boundingBox();
  if (!box) throw new Error('Recording target is not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 });
  await pause(350);
}
async function click(locator) {
  await point(locator);
  await locator.click();
}
async function scene(text, seconds, action = async () => {}) {
  const start = Date.now();
  timings.push({ startSeconds: +((start - started) / 1000).toFixed(2), text });
  await page.locator('#demo-caption').evaluate((el, value) => { el.textContent = value; }, text);
  await page.locator('#demo-step').evaluate((el, value) => { el.textContent = value; }, `${timings.length} / 9 · LOCAL APP · SYNTHETIC DATA`);
  await action();
  await pause(Math.max(0, seconds * 1000 - (Date.now() - start)));
  console.log(`Recorded scene ${timings.length}/9`);
}

try {
  // A fresh context supplies empty storage and the app's default fictional sprint.
  await page.goto('http://127.0.0.1:4175/dashboard');
  await expect(page.getByRole('heading', { name: 'Fictional demo data' })).toBeVisible();
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      body { padding-bottom: 120px !important; }
      #demo-band { position:fixed; bottom:0; left:0; right:0; height:104px; box-sizing:border-box;
        padding:16px 40px; background:#101722; color:#fff; border-top:1px solid #53627a;
        z-index:2147483645; font-family:Arial,sans-serif; pointer-events:none; }
      #demo-step { color:#b7caff; font-size:12px; letter-spacing:.04em; margin-bottom:8px; }
      #demo-caption { font-size:21px; line-height:1.35; max-width:1150px; }
      #demo-cursor { position:fixed; width:20px; height:20px; border:3px solid #fff; border-radius:50%;
        box-shadow:0 1px 5px #000; background:#245bd0; pointer-events:none; z-index:2147483647;
        left:1220px; top:40px; transform:translate(-50%,-50%); }
      #demo-title { position:fixed; inset:0 0 104px; background:#0e1015; display:flex; flex-direction:column;
        justify-content:center; padding:80px; z-index:2147483646; color:#edeff3; font-family:Arial,sans-serif; }
      #demo-title strong { font-size:52px; line-height:1.15; max-width:900px; }
      #demo-title p { font-size:25px; color:#b7caff; max-width:880px; line-height:1.5; }
    `;
    document.head.append(style);
    const band = document.createElement('div'); band.id = 'demo-band';
    const step = document.createElement('div'); step.id = 'demo-step';
    const caption = document.createElement('div'); caption.id = 'demo-caption';
    band.append(step, caption);
    const cursor = document.createElement('div'); cursor.id = 'demo-cursor';
    const title = document.createElement('div'); title.id = 'demo-title';
    const name = document.createElement('strong'); name.textContent = 'Sprint Progress Analyzer';
    const subtitle = document.createElement('p'); subtitle.textContent = 'A practical view of delivery risk — with clear limits on what the data can tell you.';
    title.append(name, subtitle); document.body.append(band, cursor, title);
    document.addEventListener('mousemove', (event) => { cursor.style.left = `${event.clientX}px`; cursor.style.top = `${event.clientY}px`; });
    document.addEventListener('mousedown', () => { cursor.style.background = '#fff'; });
    document.addEventListener('mouseup', () => { cursor.style.background = '#245bd0'; });
  });
  started = Date.now();
  await scene('A short walkthrough of the real app. All tickets and people shown are fictional.', 5);
  await page.locator('#demo-title').evaluate((el) => el.remove());
  await scene('Start with progress: 53 points completed, 41 remaining, and scope that changed.', 8);
  await scene('Risk signals explain what deserves a conversation with the team.', 8, async () => {
    await point(page.getByRole('heading', { name: 'Sprint Signals', exact: true }));
  });
  await scene('Filter to blocked work to find the tickets behind the warning.', 7, async () => {
    await click(page.getByRole('button', { name: 'Blocked', exact: true }));
    await expect(page.getByRole('table', { name: 'Current sprint issues' }).getByRole('row')).toHaveCount(3);
  });
  await scene('Import a sprint CSV locally. This example file contains only synthetic tickets.', 10, async () => {
    await click(page.getByRole('button', { name: 'Import Jira CSV', exact: true }));
    await point(page.getByLabel('Start date')); await page.getByLabel('Start date').fill('2026-11-02');
    await point(page.getByLabel('End date')); await page.getByLabel('End date').fill('2026-11-16');
    await point(page.getByLabel('CSV file')); await page.getByLabel('CSV file').setInputFiles(path.resolve('examples/sprint.csv'));
    await click(page.getByRole('button', { name: 'Import "sprint.csv"', exact: true }));
    await expect(page.getByRole('heading', { name: 'CSV snapshot · limited history' })).toBeVisible();
  });
  await scene('A CSV has no scope history. Unavailable means unknown, rather than zero changes.', 8, async () => {
    await point(page.getByText('Original Commitment', { exact: true }));
    await expect(page.getByText('Original Commitment', { exact: true }).locator('..')).toContainText('Unavailable');
  });
  await scene('Correct unfamiliar statuses. Here, Discovery should count as In Progress.', 8, async () => {
    const mapping = page.getByLabel('Map status Discovery');
    await point(mapping); await mapping.selectOption('In Progress');
    await pause(2200); // Let the corrected value remain readable before applying it.
    await click(page.getByRole('button', { name: 'Re-import with these mappings' }));
  });
  await scene('Check the result: the imported ticket now appears as In Progress.', 8, async () => {
    await click(page.getByRole('button', { name: 'All', exact: true }).first());
    const row = page.getByRole('row').filter({ hasText: 'DEMO-4' });
    await expect(row).toContainText('In Progress');
    await point(row);
  });
  await scene('Reset to the demo. Use the signals to guide discussion, not to predict a finish date.', 7, async () => {
    await click(page.getByRole('button', { name: 'Reset to demo data' }));
    await expect(page.getByRole('heading', { name: 'Fictional demo data' })).toBeVisible();
    await click(page.getByRole('button', { name: 'Close', exact: true }));
    await page.evaluate(() => window.scrollTo(0, 0));
  });
  const duration = (Date.now() - started) / 1000;
  const elapsedBeforeScenes = timings[0].startSeconds;
  await context.close();
  const raw = await video.path();
  // Trim setup frames using the first caption's actual timestamp in the raw recording.
  // The video starts before navigation; use its duration minus the measured scene duration.
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', raw], { encoding: 'utf8' });
  if (probe.status !== 0) throw new Error('Could not inspect recorded video');
  const trim = Math.max(0, Number(probe.stdout.trim()) - duration);
  const result = spawnSync('ffmpeg', ['-y', '-v', 'error', '-ss', trim.toFixed(3), '-i', raw, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(output, 'sprint-walkthrough.mp4')], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Video conversion failed');
  await writeFile(path.join(output, 'sprint-walkthrough-scenes.json'), JSON.stringify({ durationSeconds: +duration.toFixed(2), syntheticDataOnly: true, silent: true, captionOffsetSeconds: elapsedBeforeScenes, scenes: timings }, null, 2) + '\n');
  console.log(`Saved ${duration.toFixed(1)} seconds to docs/media/sprint-walkthrough.mp4`);
} finally {
  await context.close();
  await browser.close();
}
