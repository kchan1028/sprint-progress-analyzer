import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/tests/setup.ts'],
  },
})
