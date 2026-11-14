import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Serve the production preview with the same security headers as the host (vercel.json),
// so the Playwright suite runs under the real Content Security Policy. HSTS and
// upgrade-insecure-requests are left out: the preview is plain http on 127.0.0.1.
const hostHeaders: { key: string; value: string }[] =
  JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')).headers[0].headers
const previewHeaders = Object.fromEntries(
  hostHeaders
    .filter(({ key }) => key !== 'Strict-Transport-Security')
    .map(({ key, value }) => [key, value.replace(/;\s*upgrade-insecure-requests/, '')]),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: { headers: previewHeaders },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/tests/setup.ts'],
  },
})
