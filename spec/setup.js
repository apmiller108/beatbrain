import { expect, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend expect with testing-library matchers
expect.extend(matchers)

// Mock Electron app module
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((name) => {
      if (name === 'userData') {
        return path.join(os.tmpdir(), 'beatbrain-test')
      }
      return '/mock/path'
    })
  }
}))

// Create test databases directory before all tests
beforeAll(() => {
  const testDbPath = path.join(os.tmpdir(), 'beatbrain-test')
  if (!fs.existsSync(testDbPath)) {
    fs.mkdirSync(testDbPath, { recursive: true })
  }
})

// Clean up DOM after each test
afterEach(() => {
  cleanup()
})

// Clean up test databases after all tests
afterAll(() => {
  const testDbPath = path.join(os.tmpdir(), 'beatbrain-test')
  if (fs.existsSync(testDbPath)) {
    fs.rmSync(testDbPath, { recursive: true, force: true })
  }
})
