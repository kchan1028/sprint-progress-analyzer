import { performance } from 'node:perf_hooks';
import { cpus } from 'node:os';
import { parseJiraCsv } from '../src/utils/parseJiraCsv';

const meta = { name: 'Synthetic benchmark', startDate: '2026-11-02', endDate: '2026-11-16' };
const results = [];
for (const rows of [100, 1000, 10000, 50000]) {
  const csv = 'Issue key,Summary,Status,Story Points,Created,Updated\n' + Array.from({ length: rows }, (_, i) =>
    `BENCH-${i},"Synthetic task ${i}, with a quoted comma",${i % 2 ? 'In Progress' : 'Done'},3,2026-11-02,2026-11-05`,
  ).join('\n');
  parseJiraCsv(csv, meta); // warmup; generation and warmup are excluded from timing
  const samples = Array.from({ length: 7 }, () => {
    const start = performance.now();
    const parsed = parseJiraCsv(csv, meta);
    const duration = performance.now() - start;
    if (parsed.issues.length !== rows) throw new Error('Benchmark row count mismatch');
    return duration;
  }).sort((a, b) => a - b);
  results.push({ rows, bytes: Buffer.byteLength(csv), medianMs: +samples[3].toFixed(2), maxMs: +samples[6].toFixed(2) });
}
console.log(JSON.stringify({ runtime: process.version, platform: process.platform, arch: process.arch, cpu: cpus()[0].model, samples: 7, results }, null, 2));
