import { chromium } from '@playwright/test';
import { cpus } from 'node:os';
import { LARGE_IMPORT_ROW_WARNING } from '../src/utils/thresholds';

// Run against the production preview started by `npm run preview -- --port 4175`.
const browser = await chromium.launch();
const results = [];
try {
  for (const rows of [100, 1000, 5000]) {
    const samples = [];
    for (let run = 0; run < 3; run++) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto('http://127.0.0.1:4175/analyze');
      await page.getByRole('heading', { name: 'Fictional demo data' }).waitFor();
      const csv = 'Issue key,Summary,Status,Story Points,Updated\n' + Array.from({ length: rows }, (_, i) => `BENCH-${i},Synthetic task ${i},Done,3,2026-11-05`).join('\n');
      await page.getByLabel('CSV file').setInputFiles({ name: 'benchmark.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
      // Observe frame gaps during click, parsing, service notification, and rendering.
      await page.evaluate(`(() => {
        const state = { start: performance.now(), last: performance.now(), maxGap: 0, running: true };
        window.benchmark = state;
        function tick(now) {
          state.maxGap = Math.max(state.maxGap, now - state.last);
          state.last = now;
          if (state.running) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      })()`);
      await page.getByRole('button', { name: 'Import "benchmark.csv"', exact: true }).click();
      // Files above LARGE_IMPORT_ROW_WARNING ask for confirmation first.
      if (rows > LARGE_IMPORT_ROW_WARNING) await page.getByRole('button', { name: 'Import anyway', exact: true }).click();
      await page.getByRole('heading', { name: 'CSV snapshot · limited history' }).waitFor();
      await page.getByRole('table', { name: 'Current sprint issues' }).getByRole('row').last().waitFor();
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      const measurement = await page.evaluate(() => {
        const state = (window as unknown as { benchmark: { start: number; running: boolean; maxGap: number } }).benchmark;
        state.running = false;
        return { elapsedMs: Math.round(performance.now() - state.start), maxFrameGapMs: Math.round(state.maxGap) };
      });
      samples.push(measurement);
      await page.close();
    }
    results.push({ rows, samples });
  }
  console.log(JSON.stringify({ browser: browser.version(), cpu: cpus()[0].model, viewport: '1280x900', results }, null, 2));
} finally {
  await browser.close();
}
