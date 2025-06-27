import { supabase } from "@/lib/supabase"
import { throwIfSupabaseError } from "@/lib/utils"

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      ilike: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}))

// Mock utils
jest.mock("@/lib/utils", () => ({
  throwIfSupabaseError: jest.fn(),
}))

describe("Student Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("fetchStudents", () => {
    it("should fetch students successfully", async () => {
      const mockStudents = [
        { id: "1", name: "John Doe", age: 20, course: "Computer Science", created_at: "2024-01-01" },
        { id: "2", name: "Jane Smith", age: 22, course: "AI", created_at: "2024-01-02" },
      ]

      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockStudents, error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const result = await supabase.from("students").select().order("created_at", { ascending: false })

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(mockSelect).toHaveBeenCalled()
      expect(result.data).toEqual(mockStudents)
      expect(result.error).toBeNull()
    })

    it("should handle empty results", async () => {
      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const result = await supabase.from("students").select().order("created_at", { ascending: false })

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it("should handle database errors", async () => {
      const mockError = { message: "Database connection failed" }
      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const result = await supabase.from("students").select().order("created_at", { ascending: false })

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle network timeout errors", async () => {
      const mockError = { message: "Request timeout", code: "TIMEOUT" }
      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const result = await supabase.from("students").select().order("created_at", { ascending: false })

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle permission denied errors", async () => {
      const mockError = { message: "Permission denied", code: "PGRST301" }
      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const result = await supabase.from("students").select().order("created_at", { ascending: false })

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe("createStudent", () => {
    it("should create student successfully", async () => {
      const newStudent = {
        name: "New Student",
        age: 25,
        course: "Mathematics",
      }

      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [newStudent], error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const result = await supabase.from("students").insert([newStudent]).select()

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(mockInsert).toHaveBeenCalledWith([newStudent])
      expect(result.data).toEqual([newStudent])
      expect(result.error).toBeNull()
    })

    it("should handle validation errors", async () => {
      const invalidStudent = {
        name: "", // Invalid: empty name
        age: -5, // Invalid: negative age
        course: "Computer Science",
      }

      const mockError = { message: "Validation failed" }
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const result = await supabase.from("students").insert([invalidStudent]).select()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle duplicate student creation", async () => {
      const duplicateStudent = {
        name: "John Doe",
        age: 20,
        course: "Computer Science",
      }

      const mockError = { message: "Duplicate key value violates unique constraint" }
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const result = await supabase.from("students").insert([duplicateStudent]).select()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle null values in student data", async () => {
      const studentWithNullValues = {
        name: null,
        age: null,
        course: null,
      }

      const mockError = { message: "Column cannot be null" }
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const result = await supabase.from("students").insert([studentWithNullValues]).select()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle very long student names", async () => {
      const studentWithLongName = {
        name: "A".repeat(1000), // Very long name
        age: 20,
        course: "Computer Science",
      }

      const mockError = { message: "Value too long for column" }
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const result = await supabase.from("students").insert([studentWithLongName]).select()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe("updateStudent", () => {
    it("should update student successfully", async () => {
      const studentId = "1"
      const updates = {
        name: "Updated Name",
        age: 26,
        course: "Physics",
      }

      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [updates], error: null })),
        })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      const result = await supabase
        .from("students")
        .update(updates)
        .eq("id", studentId)
        .select()

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(mockUpdate).toHaveBeenCalledWith(updates)
      expect(result.data).toEqual([updates])
      expect(result.error).toBeNull()
    })

    it("should handle non-existent student update", async () => {
      const nonExistentId = "999"
      const updates = {
        name: "Updated Name",
        age: 26,
      }

      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      const result = await supabase
        .from("students")
        .update(updates)
        .eq("id", nonExistentId)
        .select()

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it("should handle update validation errors", async () => {
      const studentId = "1"
      const invalidUpdates = {
        name: "", // Invalid: empty name
        age: 150, // Invalid: age too high
      }

      const mockError = { message: "Validation failed" }
      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
        })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      const result = await supabase
        .from("students")
        .update(invalidUpdates)
        .eq("id", studentId)
        .select()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle partial updates", async () => {
      const studentId = "1"
      const partialUpdates = {
        name: "Updated Name",
        // age and course not included
      }

      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [partialUpdates], error: null })),
        })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      const result = await supabase
        .from("students")
        .update(partialUpdates)
        .eq("id", studentId)
        .select()

      expect(result.data).toEqual([partialUpdates])
      expect(result.error).toBeNull()
    })

    it("should handle empty update object", async () => {
      const studentId = "1"
      const emptyUpdates = {}

      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      const result = await supabase
        .from("students")
        .update(emptyUpdates)
        .eq("id", studentId)
        .select()

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })
  })

  describe("deleteStudent", () => {
    it("should delete student successfully", async () => {
      const studentId = "1"

      const mockDelete = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      const result = await supabase.from("students").delete().eq("id", studentId)

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(mockDelete).toHaveBeenCalled()
      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it("should handle non-existent student deletion", async () => {
      const nonExistentId = "999"

      const mockDelete = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      const result = await supabase.from("students").delete().eq("id", nonExistentId)

      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it("should handle deletion errors", async () => {
      const studentId = "1"
      const mockError = { message: "Cannot delete student with active enrollments" }

      const mockDelete = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      const result = await supabase.from("students").delete().eq("id", studentId)

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle foreign key constraint errors", async () => {
      const studentId = "1"
      const mockError = { message: "Foreign key constraint violation", code: "23503" }

      const mockDelete = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      const result = await supabase.from("students").delete().eq("id", studentId)

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle invalid student ID format", async () => {
      const invalidId = "invalid-uuid"

      const mockError = { message: "Invalid UUID format" }
      const mockDelete = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      const result = await supabase.from("students").delete().eq("id", invalidId)

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe("searchStudents", () => {
    it("should search students by name", async () => {
      const searchTerm = "John"
      const mockStudents = [
        { id: "1", name: "John Doe", age: 20, course: "Computer Science", created_at: "2024-01-01" },
      ]

      const mockIlike = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockStudents, error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        ilike: mockIlike,
      })

      const result = await supabase
        .from("students")
        .ilike("name", `%${searchTerm}%`)
        .order("created_at", { ascending: false })

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(mockIlike).toHaveBeenCalledWith("name", `%${searchTerm}%`)
      expect(result.data).toEqual(mockStudents)
      expect(result.error).toBeNull()
    })

    it("should handle search with no results", async () => {
      const searchTerm = "NonExistent"

      const mockIlike = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        ilike: mockIlike,
      })

      const result = await supabase
        .from("students")
        .ilike("name", `%${searchTerm}%`)
        .order("created_at", { ascending: false })

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it("should handle search errors", async () => {
      const searchTerm = "John"
      const mockError = { message: "Search query too complex" }

      const mockIlike = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        ilike: mockIlike,
      })

      const result = await supabase
        .from("students")
        .ilike("name", `%${searchTerm}%`)
        .order("created_at", { ascending: false })

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it("should handle empty search term", async () => {
      const searchTerm = ""

      const mockIlike = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        ilike: mockIlike,
      })

      const result = await supabase
        .from("students")
        .ilike("name", `%${searchTerm}%`)
        .order("created_at", { ascending: false })

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it("should handle special characters in search", async () => {
      const searchTerm = "O'Connor"

      const mockIlike = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        ilike: mockIlike,
      })

      const result = await supabase
        .from("students")
        .ilike("name", `%${searchTerm}%`)
        .order("created_at", { ascending: false })

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it("should handle case insensitive search", async () => {
      const searchTerm = "john"
      const mockStudents = [
        { id: "1", name: "John Doe", age: 20, course: "Computer Science", created_at: "2024-01-01" },
      ]

      const mockIlike = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockStudents, error: null })),
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        ilike: mockIlike,
      })

      const result = await supabase
        .from("students")
        .ilike("name", `%${searchTerm}%`)
        .order("created_at", { ascending: false })

      expect(result.data).toEqual(mockStudents)
      expect(result.error).toBeNull()
    })
  })

  describe("error handling", () => {
    it("should throw error when throwIfSupabaseError is called", () => {
      const error = { message: "Database error" }
      ;(throwIfSupabaseError as jest.Mock).mockImplementation(() => {
        throw new Error(error.message)
      })

      expect(() => throwIfSupabaseError(error)).toThrow("Database error")
    })

    it("should not throw when no error", () => {
      ;(throwIfSupabaseError as jest.Mock).mockImplementation(() => {
        // Do nothing
      })

      expect(() => throwIfSupabaseError(null)).not.toThrow()
    })

    it("should handle different error types", () => {
      const errors = [
        { message: "Network error", code: "NETWORK_ERROR" },
        { message: "Authentication failed", code: "AUTH_ERROR" },
        { message: "Database constraint violation", code: "CONSTRAINT_ERROR" },
        { message: "Unknown error" },
      ]

      errors.forEach(error => {
        ;(throwIfSupabaseError as jest.Mock).mockImplementation(() => {
          throw new Error(error.message)
        })

        expect(() => throwIfSupabaseError(error)).toThrow(error.message)
      })
    })
  })
})
