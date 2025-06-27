"use client"

import "@testing-library/jest-dom"

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"

// Suppress React act() warnings for Radix UI components
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: An update to") &&
      args[0].includes("inside a test was not wrapped in act(...)")
    ) {
      return
    }
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: Missing `Description` or `aria-describedby`")
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: Missing `Description` or `aria-describedby`")
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver for Radix UI components
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia for responsive components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock scrollTo for smooth scrolling
window.scrollTo = jest.fn()

// Mock getComputedStyle for CSS-in-JS libraries
Object.defineProperty(window, "getComputedStyle", {
  value: () => ({
    getPropertyValue: () => "",
  }),
})

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}))

// Mock toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Enhanced Supabase mock with realistic data
jest.mock("@/lib/supabase", () => {
  // Mock data storage for tests
  let mockStudents = []
  let mockCount = 0

  const generateMockStudent = (data = {}) => ({
    id: `test-id-${Date.now()}-${Math.random()}`,
    name: data.name || "Test Student",
    email: data.email || "test@example.com",
    age: data.age || 20,
    course: data.course || "Computer Science",
    grade: data.grade || "A",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...data
  })

  const createMockQuery = () => {
    let queryType = 'select'
    let queryData = null
    let queryError = null
    let queryCount = null
    let queryFilters = {}
    let shouldFail = false
    let failReason = null

    const mockQuery = {
      select: jest.fn((columns = "*", options = {}) => {
        queryType = 'select'
        if (options.count === "exact") {
          queryCount = mockStudents.length
        }
        return mockQuery
      }),
      insert: jest.fn((data) => {
        queryType = 'insert'
        
        // Check for validation errors
        if (Array.isArray(data)) {
          const hasInvalidData = data.some(student => 
            !student.name || student.name.trim() === "" || 
            student.age < 0 || student.age > 150
          )
          
          if (hasInvalidData) {
            shouldFail = true
            failReason = "Validation failed"
            queryError = { message: "Validation failed" }
            return mockQuery
          }
          
          const newStudents = data.map(student => generateMockStudent(student))
          mockStudents.push(...newStudents)
          queryData = newStudents
          mockCount = mockStudents.length
        }
        return mockQuery
      }),
      update: jest.fn((data) => {
        queryType = 'update'
        
        // Check for validation errors
        if (data && (data.age < 0 || data.age > 150 || !data.name || data.name.trim() === "")) {
          shouldFail = true
          failReason = "Validation failed"
          queryError = { message: "Validation failed" }
          return mockQuery
        }
        
        // Simulate updating the first matching student
        if (mockStudents.length > 0) {
          const updatedStudent = { ...mockStudents[0], ...data }
          mockStudents[0] = updatedStudent
          queryData = [updatedStudent] // Return as array for consistency
        } else {
          queryData = [] // No students to update
        }
        return mockQuery
      }),
      delete: jest.fn(() => {
        queryType = 'delete'
        return mockQuery
      }),
      eq: jest.fn((column, value) => {
        queryFilters[column] = value
        if (queryType === 'delete') {
          mockStudents = mockStudents.filter(student => student[column] !== value)
          mockCount = mockStudents.length
        } else if (queryType === 'select') {
          // Filter students based on the condition
          queryData = mockStudents.filter(student => student[column] === value)
        }
        return mockQuery
      }),
      neq: jest.fn(() => mockQuery),
      gt: jest.fn(() => mockQuery),
      gte: jest.fn(() => mockQuery),
      lt: jest.fn(() => mockQuery),
      lte: jest.fn(() => mockQuery),
      like: jest.fn(() => mockQuery),
      ilike: jest.fn((column, pattern) => {
        const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i')
        queryData = mockStudents.filter(student => regex.test(student[column]))
        return mockQuery
      }),
      is: jest.fn(() => mockQuery),
      in: jest.fn(() => mockQuery),
      contains: jest.fn(() => mockQuery),
      containedBy: jest.fn(() => mockQuery),
      rangeGt: jest.fn(() => mockQuery),
      rangeGte: jest.fn(() => mockQuery),
      rangeLt: jest.fn(() => mockQuery),
      rangeLte: jest.fn(() => mockQuery),
      rangeAdjacent: jest.fn(() => mockQuery),
      overlaps: jest.fn(() => mockQuery),
      textSearch: jest.fn(() => mockQuery),
      match: jest.fn(() => mockQuery),
      not: jest.fn(() => mockQuery),
      or: jest.fn(() => mockQuery),
      order: jest.fn((column, options = {}) => {
        if (queryData && Array.isArray(queryData)) {
          queryData.sort((a, b) => {
            const aVal = a[column]
            const bVal = b[column]
            if (options.ascending === false) {
              return bVal > aVal ? 1 : -1
            }
            return aVal > bVal ? 1 : -1
          })
        }
        return mockQuery
      }),
      limit: jest.fn((count) => {
        if (queryData && Array.isArray(queryData)) {
          queryData = queryData.slice(0, count)
        }
        return mockQuery
      }),
      range: jest.fn((from, to) => {
        if (queryData && Array.isArray(queryData)) {
          queryData = queryData.slice(from, to + 1)
        }
        return mockQuery
      }),
      single: jest.fn(() => {
        const result = queryData && Array.isArray(queryData) ? queryData[0] : null
        return Promise.resolve({ data: result, error: null })
      }),
      maybeSingle: jest.fn(() => {
        const result = queryData && Array.isArray(queryData) ? queryData[0] : null
        return Promise.resolve({ data: result, error: null })
      }),
      then: jest.fn((resolve) => {
        let result
        if (shouldFail) {
          result = null
        } else if (queryType === 'select') {
          result = queryData || mockStudents
        } else if (queryType === 'insert') {
          result = queryData
        } else if (queryType === 'update') {
          result = queryData || []
        } else if (queryType === 'delete') {
          result = null
        }

        const response = { 
          data: result, 
          error: queryError,
          count: queryCount
        }
        
        return Promise.resolve(response).then(resolve)
      }),
      catch: jest.fn((reject) => {
        return Promise.resolve({ data: [], error: null }).catch(reject)
      }),
    }

    return mockQuery
  }

  return {
    supabase: {
      from: jest.fn(() => createMockQuery()),
      auth: {
        signUp: jest.fn(() => Promise.resolve({ data: null, error: null })),
        signIn: jest.fn(() => Promise.resolve({ data: null, error: null })),
        signOut: jest.fn(() => Promise.resolve({ error: null })),
        getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      },
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
          download: jest.fn(() => Promise.resolve({ data: null, error: null })),
          remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      },
    },
    throwIfSupabaseError: jest.fn((error) => {
      if (error) {
        throw new Error(error.message || "Unknown Supabase error")
      }
    }),
  }
})

// Mock Recharts components
jest.mock("recharts", () => ({
  LineChart: ({ children, ...props }) => <div data-testid="line-chart" {...props}>{children}</div>,
  Line: ({ ...props }) => <div data-testid="line" {...props} />,
  XAxis: ({ ...props }) => <div data-testid="x-axis" {...props} />,
  YAxis: ({ ...props }) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: ({ ...props }) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: ({ ...props }) => <div data-testid="tooltip" {...props} />,
  ResponsiveContainer: ({ children, ...props }) => <div data-testid="responsive-container" {...props}>{children}</div>,
  BarChart: ({ children, ...props }) => <div data-testid="bar-chart" {...props}>{children}</div>,
  Bar: ({ ...props }) => <div data-testid="bar" {...props} />,
  PieChart: ({ children, ...props }) => <div data-testid="pie-chart" {...props}>{children}</div>,
  Pie: ({ ...props }) => <div data-testid="pie" {...props} />,
  Cell: ({ ...props }) => <div data-testid="cell" {...props} />,
  Legend: () => <div data-testid="legend" />,
}))

// Global test timeout
jest.setTimeout(10000)
