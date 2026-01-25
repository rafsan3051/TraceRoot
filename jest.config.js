const nextJest = require('next/jest')

// Polyfill global Request/Response before anything else loads
if (typeof globalThis !== 'undefined' && !globalThis.Request) {
  try {
    // Node.js 18+ has native fetch
    // Do nothing - it's built-in
  } catch (e) {
    // Fallback polyfill
    globalThis.Request = class {
      constructor(input, init) {
        this.url = typeof input === 'string' ? input : input.url
        this.method = (init && init.method) || 'GET'
        this.headers = new Map(Object.entries((init && init.headers) || {}))
        this.body = (init && init.body) || null
      }
      async json() { return typeof this.body === 'string' ? JSON.parse(this.body) : this.body }
      async text() { return typeof this.body === 'string' ? this.body : JSON.stringify(this.body) }
    }
  }
}

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '!**/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['next/dist/build/swc/jest-transformer', {}],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
