import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }

// Helper functions for tests
export const createMockStudent = (overrides = {}) => ({
  id: "test-id",
  name: "Test Student",
  age: 20,
  course: "Computer Science",
  created_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
})

export const createMockStudents = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockStudent({
      id: `test-id-${i}`,
      name: `Test Student ${i}`,
      age: 20 + i,
      course: i % 2 === 0 ? "Computer Science" : "AI",
    }),
  )

// Mock data generators
export const mockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
})

export const mockSupabaseError = (message: string) => ({
  message,
  details: "Test error details",
  code: "TEST_ERROR",
})
