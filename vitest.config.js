import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./spec/setup.js'],
    include: ['spec/**/*.{test,spec}.{js,mjs,ts,jsx}'],
    exclude: ['node_modules', 'out', 'dist', 'spec/e2e'],
    // Mock Electron APIs
    mockReset: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@spec': resolve(__dirname, 'spec'),
    }
  }
})
