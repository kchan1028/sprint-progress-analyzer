# Synthetic CSV performance

Measured November 13, 2026, on an Apple M3 Max, macOS arm64, Node.js 20.19.6, and headless Chromium 159.0.8154.6. These local measurements are examples, not a capacity guarantee or a comparison with other products. No real Jira data was used.

## Parsing alone

Run `npm run benchmark`. The script creates CSVs with quoted commas, alternating Done/In Progress statuses, estimates, and ISO dates. It excludes fixture generation and one warmup from timing, validates the imported row count, and reports seven measured parses per size.

| Rows | CSV bytes | Median parse time | Slowest measured parse |
| ---: | ---: | ---: | ---: |
| 100 | 8,283 | 0.45 ms | 0.57 ms |
| 1,000 | 84,333 | 2.35 ms | 2.64 ms |
| 10,000 | 862,833 | 28.78 ms | 34.43 ms |
| 50,000 | 4,402,833 | 166.13 ms | 204.28 ms |

[Recorded parser output](benchmarks/parser-2026-11-13.json). Timing includes parsing and constructing issue objects, but not DOM rendering, service delays, file reading, or user interaction.

## Browser import and responsiveness

Build with `npm run build:demo`. In one terminal run `npm run preview -- --host 127.0.0.1 --port 4175 --strictPort`; in another run `npm run benchmark:browser` after installing Chromium with `npx playwright install chromium`.

The script uses a fresh page for each of three imports per size, at a 1280×900 viewport. Its simpler fixture contains only Done tickets. Timing starts just before Playwright clicks Import and ends after the imported heading/table appear and two animation frames have elapsed. It includes automation overhead, file handling, parsing, the service's simulated latency, and rendering. It is not a pure input-to-paint measurement. The largest observed requestAnimationFrame gap is an indicator of a stall during that interval, not a standardized responsiveness score.

| Rows | Median completion time | Largest frame gap across three runs |
| ---: | ---: | ---: |
| 100 | 868 ms | 17 ms |
| 1,000 | 901 ms | 117 ms |
| 5,000 | 1,423 ms | 800 ms |

[All browser samples](benchmarks/browser-2026-11-13.json). No CPU throttling was used. Mixed-status sprints with more signals, lower-powered devices, and other browsers may behave differently. These are a small number of samples on one machine; garbage collection, scheduling, and browser state affect results.

## What this tells us

Parsing alone looks inexpensive at ordinary sprint sizes in this environment. That does not make the whole dashboard responsive for large exports. The 5,000-ticket example creates a substantial frame gap, and the UI currently renders all matching rows and completion markers. Do not treat 50,000 parsed rows as a supported interactive size.

The next performance work should measure realistic user exports, then evaluate pagination or virtualization and reducing timeline markers. Moving parsing to a worker would address parsing stalls but would not remove the cost of rendering thousands of elements. No maximum file size or protective row limit is currently enforced.
