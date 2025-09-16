import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./spec/setup.js'],
    include: ['spec/**/*.{test,spec}.{js,mjs,ts}'],
    exclude: ['node_modules', 'out', 'dist'],
    // Mock Electron APIs
    mockReset: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  }
})
