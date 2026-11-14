# Recorded product walkthrough

[Watch or download the captioned MP4](media/sprint-walkthrough.mp4).

The silent recording shows the real local app using its fictional sprint and committed synthetic CSV. Captions and a visible pointer are presentation overlays added only by the recording script. No company exports, shared browser profile, or private hosted URL are used. The hosted demo remains private.

## Transcript

1. A short walkthrough of the real app. All tickets and people shown are fictional.
2. Start with progress: 53 points completed, 41 remaining, and scope that changed.
3. Risk signals explain what deserves a conversation with the team.
4. Filter to blocked work to find the tickets behind the warning.
5. Import a sprint CSV locally. This example file contains only synthetic tickets.
6. A CSV has no scope history. Unavailable means unknown, rather than zero changes.
7. Correct unfamiliar statuses. Here, Discovery should count as In Progress.
8. Check the result: the imported ticket now appears as In Progress.
9. Reset to the demo. Use the signals to guide discussion, not to predict a finish date.

The scene timestamps are saved in [the recording sidecar](media/sprint-walkthrough-scenes.json). The recording uses a UTC browser timezone so date-only import fields and displayed sprint dates agree. Demo dates depend on when the recording is made. The import example uses November 2–16, 2026.

## Regenerate it

Install the project dependencies, Chromium, and FFmpeg (including ffprobe). In one terminal:

```bash
npm run build:demo
npm run preview -- --host 127.0.0.1 --port 4175 --strictPort
```

In another terminal:

```bash
npx playwright install chromium
npm run record:demo
```

The script uses only `http://127.0.0.1:4175`, a fresh browser context, and synthetic data. It asserts the key results before exporting H.264 MP4 to `docs/media/`. Raw browser recordings stay in a temporary directory. Review the video before committing regenerated assets; overlays, browser rendering, and timing can change across machines and tool versions.
