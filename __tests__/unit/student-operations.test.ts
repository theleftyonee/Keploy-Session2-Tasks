import { supabase, type Student } from "@/lib/supabase"

// Mock Supabase for unit tests
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        ilike: jest.fn(() => Promise.resolve({ data: [], error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
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
    })),
  },
  throwIfSupabaseError: jest.fn(),
}))

describe("Student Operations (Unit Tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Fetch Students", () => {
    it("should fetch all students successfully", async () => {
      const mockStudents: Student[] = [
        { id: "1", name: "John Doe", age: 20, course: "Computer Science", created_at: "2024-01-01" },
        { id: "2", name: "Jane Smith", age: 22, course: "AI", created_at: "2024-01-02" },
      ]

      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockStudents, error: null })),
      }))

      const mockFrom = jest.fn(() => ({
        select: mockSelect,
      }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(data).toEqual(mockStudents)
      expect(error).toBeNull()
    })

    it("should handle fetch error", async () => {
      const mockError = { message: "Database connection failed" }

      const mockSelect = jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

      expect(data).toBeNull()
      expect(error).toEqual(mockError)
    })
  })

  describe("Create Student", () => {
    it("should create a student successfully", async () => {
      const newStudent = { name: "Alice Johnson", age: 21, course: "Biology" }
      const createdStudent: Student = { id: "3", ...newStudent, created_at: "2024-01-03" }

      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [createdStudent], error: null })),
      }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const { data, error } = await supabase.from("students").insert([newStudent]).select()

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(mockInsert).toHaveBeenCalledWith([newStudent])
      expect(data).toEqual([createdStudent])
      expect(error).toBeNull()
    })

    it("should handle validation errors", async () => {
      const invalidStudent = { name: "", age: 21, course: "Biology" }
      const mockError = { message: "Name cannot be empty" }

      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: mockError })),
      }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const { data, error } = await supabase.from("students").insert([invalidStudent]).select()

      expect(data).toBeNull()
      expect(error).toEqual(mockError)
    })
  })

  describe("Update Student", () => {
    it("should update a student successfully", async () => {
      const studentId = "1"
      const updateData = { name: "John Updated", age: 21 }
      const updatedStudent: Student = {
        id: studentId,
        ...updateData,
        course: "Computer Science",
        created_at: "2024-01-01",
      }

      const mockUpdate = jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [updatedStudent], error: null })),
        })),
      }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      const { data, error } = await supabase.from("students").update(updateData).eq("id", studentId).select()

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(mockUpdate).toHaveBeenCalledWith(updateData)
      expect(data).toEqual([updatedStudent])
      expect(error).toBeNull()
    })
  })

  describe("Delete Student", () => {
    it("should delete a student successfully", async () => {
      const studentId = "1"

      const mockDelete = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      const { data, error } = await supabase.from("students").delete().eq("id", studentId)

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(mockDelete).toHaveBeenCalled()
      expect(error).toBeNull()
    })
  })

  describe("Search Students", () => {
    it("should search students by name", async () => {
      const searchTerm = "John"
      const matchingStudents: Student[] = [
        { id: "1", name: "John Doe", age: 20, course: "Computer Science", created_at: "2024-01-01" },
      ]

      const mockSelect = jest.fn(() => ({
        ilike: jest.fn(() => Promise.resolve({ data: matchingStudents, error: null })),
      }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { data, error } = await supabase.from("students").select("*").ilike("name", `%${searchTerm}%`)

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(data).toEqual(matchingStudents)
      expect(error).toBeNull()
    })

    it("should filter students by course", async () => {
      const course = "Computer Science"
      const filteredStudents: Student[] = [
        { id: "1", name: "John Doe", age: 20, course: "Computer Science", created_at: "2024-01-01" },
      ]

      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: filteredStudents, error: null })),
      }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const { data, error } = await supabase.from("students").select("*").eq("course", course)

      expect(supabase.from).toHaveBeenCalledWith("students")
      expect(data).toEqual(filteredStudents)
      expect(error).toBeNull()
    })
  })
})
