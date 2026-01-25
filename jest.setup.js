// Learn more: https://github.com/testing-library/jest-dom
// Only require in jsdom environment
if (typeof window !== 'undefined') {
  try {
    require('@testing-library/jest-dom')
  } catch (e) {
    // jest-dom not available in this environment
  }
}

// Mock Next.js Request/Response globally for API testing
if (typeof window === 'undefined') {
  // Node environment - provide Request, Response, Headers for API route testing
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
  
  // Provide minimal Request implementation for Next.js
  if (!globalThis.Request) {
    globalThis.Request = class {
      constructor(input, init) {
        this.url = typeof input === 'string' ? input : input.url
        this.method = init?.method || 'GET'
        this.headers = new Map(Object.entries(init?.headers || {}))
        this.body = init?.body
      }
      
      async json() {
        if (typeof this.body === 'string') {
          return JSON.parse(this.body)
        }
        return this.body
      }
      
      async text() {
        return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
      }
    }
  }

  // Provide minimal Response implementation
  if (!globalThis.Response) {
    globalThis.Response = class {
      constructor(body, init) {
        this.body = body
        this.status = init?.status || 200
        this.statusText = init?.statusText || 'OK'
        this.headers = new Map(Object.entries(init?.headers || {}))
      }
      
      async json() {
        if (typeof this.body === 'string') {
          return JSON.parse(this.body)
        }
        return this.body
      }
      
      async text() {
        return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
      }
    }
  }

  // Provide Headers implementation
  if (!globalThis.Headers) {
    globalThis.Headers = class {
      constructor(init) {
        this.headers = new Map(Object.entries(init || {}))
      }
      
      get(name) {
        return this.headers.get(name.toLowerCase())
      }
      
      set(name, value) {
        this.headers.set(name.toLowerCase(), value)
      }
      
      has(name) {
        return this.headers.has(name.toLowerCase())
      }
    }
  }
}

// Mock Next.js router (only in browser env)
if (typeof window !== 'undefined') {
  jest.mock('next/navigation', () => ({
    useRouter() {
      return {
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        pathname: '/',
        query: {},
        asPath: '/',
      }
    },
    useSearchParams() {
      return new URLSearchParams()
    },
    usePathname() {
      return '/'
    },
  }))

  // Mock framer-motion to avoid animation issues in tests
  jest.mock('framer-motion', () => ({
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      span: ({ children, ...props }) => <span {...props}>{children}</span>,
      a: ({ children, ...props }) => <a {...props}>{children}</a>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  }))
}

// Set up environment variables for tests (works in all environments)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-key'
}
if (!process.env.QR_SIGNING_SECRET) {
  process.env.QR_SIGNING_SECRET = 'test-qr-signing-secret'
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mongodb://localhost:27017/traceroot-test'
}
if (!process.env.NEXT_PUBLIC_APP_URL) {
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
}
if (!process.env.USE_REAL_BLOCKCHAIN) {
  process.env.USE_REAL_BLOCKCHAIN = 'false'
}
