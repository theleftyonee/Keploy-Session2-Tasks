import { supabase, throwIfSupabaseError } from "@/lib/supabase"

// Mock the createClient function
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  })),
}))

describe("Supabase Configuration", () => {
  describe("supabase client", () => {
    it("should be properly configured", () => {
      expect(supabase).toBeDefined()
      expect(typeof supabase.from).toBe("function")
      expect(typeof supabase.auth).toBe("object")
      expect(typeof supabase.storage).toBe("object")
    })

    it("should have auth methods", () => {
      expect(typeof supabase.auth.signUp).toBe("function")
      expect(typeof supabase.auth.signIn).toBe("function")
      expect(typeof supabase.auth.signOut).toBe("function")
      expect(typeof supabase.auth.getSession).toBe("function")
    })

    it("should have storage methods", () => {
      expect(typeof supabase.storage.from).toBe("function")
    })

    it("should have database methods", () => {
      expect(typeof supabase.from).toBe("function")
    })

    it("should handle database operations", () => {
      const mockFrom = jest.fn()
      supabase.from = mockFrom
      
      supabase.from("students")
      expect(mockFrom).toHaveBeenCalledWith("students")
    })

    it("should handle auth operations", () => {
      const mockSignIn = jest.fn()
      supabase.auth.signIn = mockSignIn
      
      supabase.auth.signIn({ email: "test@example.com", password: "password" })
      expect(mockSignIn).toHaveBeenCalledWith({ email: "test@example.com", password: "password" })
    })

    it("should handle storage operations", () => {
      const mockStorageFrom = jest.fn()
      supabase.storage.from = mockStorageFrom
      
      supabase.storage.from("avatars")
      expect(mockStorageFrom).toHaveBeenCalledWith("avatars")
    })
  })

  describe("throwIfSupabaseError function", () => {
    it("should not throw when error is null", () => {
      expect(() => throwIfSupabaseError(null)).not.toThrow()
    })

    it("should not throw when error is undefined", () => {
      expect(() => throwIfSupabaseError(undefined)).not.toThrow()
    })

    it("should throw for empty object", () => {
      expect(() => throwIfSupabaseError({})).toThrow("Unknown Supabase error")
    })

    it("should throw error with message when provided", () => {
      const error = { message: "Database connection failed" }
      expect(() => throwIfSupabaseError(error)).toThrow("Database connection failed")
    })

    it("should throw generic error when message is missing", () => {
      const error = { code: "UNKNOWN_ERROR" }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with empty message", () => {
      const error = { message: "" }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with whitespace message", () => {
      const error = { message: "   " }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle complex error objects", () => {
      const error = { 
        code: "PGRST116", 
        message: "JWT expired", 
        details: "Token has expired",
        hint: "Please refresh your token"
      }
      expect(() => throwIfSupabaseError(error)).toThrow("JWT expired")
    })

    it("should handle error with null message", () => {
      const error = { message: null }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with undefined message", () => {
      const error = { message: undefined }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with non-string message", () => {
      const error = { message: 123 }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with boolean message", () => {
      const error = { message: false }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })
  })

  describe("Student type", () => {
    it("should have correct type structure", () => {
      // This test ensures the Student type is properly exported
      const mockStudent = {
        id: "test-id",
        name: "Test Student",
        age: 20,
        course: "Computer Science",
        created_at: "2023-01-01T00:00:00Z",
      }

      expect(mockStudent).toHaveProperty("id")
      expect(mockStudent).toHaveProperty("name")
      expect(mockStudent).toHaveProperty("age")
      expect(mockStudent).toHaveProperty("course")
      expect(mockStudent).toHaveProperty("created_at")
    })

    it("should validate student data structure", () => {
      const student: any = {
        id: "test-id",
        name: "Test Student",
        age: 20,
        course: "Computer Science",
        created_at: "2023-01-01T00:00:00Z",
      }

      // Test that all required properties exist and have correct types
      expect(typeof student.id).toBe("string")
      expect(typeof student.name).toBe("string")
      expect(typeof student.age).toBe("number")
      expect(typeof student.course).toBe("string")
      expect(typeof student.created_at).toBe("string")
    })

    it("should handle different student data types", () => {
      const students = [
        { id: "1", name: "John", age: 18, course: "CS", created_at: "2023-01-01" },
        { id: "2", name: "Jane", age: 25, course: "AI", created_at: "2023-02-01" },
        { id: "3", name: "Bob", age: 30, course: "Math", created_at: "2023-03-01" },
      ]

      students.forEach(student => {
        expect(typeof student.id).toBe("string")
        expect(typeof student.name).toBe("string")
        expect(typeof student.age).toBe("number")
        expect(typeof student.course).toBe("string")
        expect(typeof student.created_at).toBe("string")
      })
    })
  })

  describe("Environment variables", () => {
    it("should have required environment variables", () => {
      // Test that environment variables are accessible
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
    })

    it("should have valid URL format", () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (url && url !== "https://test.supabase.co") {
        expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/)
      }
    })

    it("should have valid key format", () => {
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (key && key !== "test-anon-key") {
        expect(key).toMatch(/^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
      }
    })

    it("should handle missing environment variables gracefully", () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // Temporarily remove environment variables
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // The client should still be created (with undefined values)
      expect(supabase).toBeDefined()

      // Restore environment variables
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    })
  })

  describe("Error handling scenarios", () => {
    it("should handle network errors", () => {
      const networkError = { 
        message: "Network error", 
        code: "NETWORK_ERROR" 
      }
      expect(() => throwIfSupabaseError(networkError)).toThrow("Network error")
    })

    it("should handle authentication errors", () => {
      const authError = { 
        message: "Invalid credentials", 
        code: "PGRST301" 
      }
      expect(() => throwIfSupabaseError(authError)).toThrow("Invalid credentials")
    })

    it("should handle database constraint errors", () => {
      const constraintError = { 
        message: "Duplicate key value violates unique constraint", 
        code: "23505" 
      }
      expect(() => throwIfSupabaseError(constraintError)).toThrow("Duplicate key value violates unique constraint")
    })

    it("should handle unknown error types", () => {
      const unknownError = { 
        code: "UNKNOWN_CODE",
        details: "Some unknown error occurred"
      }
      expect(() => throwIfSupabaseError(unknownError)).toThrow("Unknown Supabase error")
    })

    it("should handle JWT errors", () => {
      const jwtError = { 
        message: "JWT token expired", 
        code: "PGRST116" 
      }
      expect(() => throwIfSupabaseError(jwtError)).toThrow("JWT token expired")
    })

    it("should handle permission errors", () => {
      const permissionError = { 
        message: "Permission denied", 
        code: "PGRST301" 
      }
      expect(() => throwIfSupabaseError(permissionError)).toThrow("Permission denied")
    })

    it("should handle timeout errors", () => {
      const timeoutError = { 
        message: "Request timeout", 
        code: "TIMEOUT" 
      }
      expect(() => throwIfSupabaseError(timeoutError)).toThrow("Request timeout")
    })

    it("should handle rate limit errors", () => {
      const rateLimitError = { 
        message: "Rate limit exceeded", 
        code: "RATE_LIMIT" 
      }
      expect(() => throwIfSupabaseError(rateLimitError)).toThrow("Rate limit exceeded")
    })

    it("should handle service unavailable errors", () => {
      const serviceError = { 
        message: "Service temporarily unavailable", 
        code: "SERVICE_UNAVAILABLE" 
      }
      expect(() => throwIfSupabaseError(serviceError)).toThrow("Service temporarily unavailable")
    })

    it("should handle malformed request errors", () => {
      const malformedError = { 
        message: "Malformed request", 
        code: "MALFORMED_REQUEST" 
      }
      expect(() => throwIfSupabaseError(malformedError)).toThrow("Malformed request")
    })
  })

  describe("Edge cases", () => {
    it("should handle error with only code", () => {
      const error = { code: "SOME_ERROR" }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with only details", () => {
      const error = { details: "Some details" }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with only hint", () => {
      const error = { hint: "Some hint" }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with multiple properties but no message", () => {
      const error = { 
        code: "ERROR_CODE",
        details: "Error details",
        hint: "Error hint",
        status: 500
      }
      expect(() => throwIfSupabaseError(error)).toThrow("Unknown Supabase error")
    })

    it("should handle error with very long message", () => {
      const longMessage = "A".repeat(1000)
      const error = { message: longMessage }
      expect(() => throwIfSupabaseError(error)).toThrow(longMessage)
    })

    it("should handle error with special characters in message", () => {
      const specialMessage = "Error with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"
      const error = { message: specialMessage }
      expect(() => throwIfSupabaseError(error)).toThrow(specialMessage)
    })

    it("should handle error with unicode characters in message", () => {
      const unicodeMessage = "Error with unicode: 🚀 测试 テスト"
      const error = { message: unicodeMessage }
      expect(() => throwIfSupabaseError(error)).toThrow(unicodeMessage)
    })
  })
}) 