import { supabase, throwIfSupabaseError } from "@/lib/supabase"

// Integration tests use real Supabase connection
describe("Database Integration Tests", () => {
  const testStudent = {
    name: "Integration Test Student",
    age: 25,
    course: "Computer Science",
  }

  let createdStudentId: string

  beforeAll(async () => {
    // Ensure we have a clean test environment
    console.log("Setting up integration tests...")
  })

  afterAll(async () => {
    // Cleanup test data
    if (createdStudentId) {
      try {
        await supabase.from("students").delete().eq("id", createdStudentId)
        console.log(`Cleaned up test student: ${createdStudentId}`)
      } catch (error) {
        console.warn("Failed to cleanup test student:", error)
      }
    }
  })

  describe("Student CRUD Operations with Real Database", () => {
    it("should create a student in the database", async () => {
      const { data, error } = await supabase.from("students").insert([testStudent]).select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(1)
      expect(data?.[0]).toMatchObject(testStudent)
      expect(data?.[0].id).toBeDefined()
      expect(data?.[0].created_at).toBeDefined()

      if (data?.[0]) {
        createdStudentId = data[0].id
      }
    })

    it("should fetch students from the database", async () => {
      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)

      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty("id")
        expect(data[0]).toHaveProperty("name")
        expect(data[0]).toHaveProperty("age")
        expect(data[0]).toHaveProperty("course")
        expect(data[0]).toHaveProperty("created_at")
      }
    })

    it("should update a student in the database", async () => {
      if (!createdStudentId) {
        throw new Error("No student created for update test")
      }

      const updateData = {
        name: "Updated Integration Test Student",
        age: 26,
      }

      const { data, error } = await supabase.from("students").update(updateData).eq("id", createdStudentId).select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(1)
      expect(data?.[0]).toMatchObject(updateData)
      expect(data?.[0].id).toBe(createdStudentId)
    })

    it("should search students by name", async () => {
      const { data, error } = await supabase.from("students").select("*").ilike("name", "%Integration%")

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        expect(data.some((student) => student.name.includes("Integration"))).toBe(true)
      }
    })

    it("should filter students by course", async () => {
      const { data, error } = await supabase.from("students").select("*").eq("course", "Computer Science")

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        expect(data.every((student) => student.course === "Computer Science")).toBe(true)
      }
    })

    it("should handle non-existent student queries", async () => {
      const { data, error } = await supabase.from("students").select("*").eq("id", "non-existent-id")

      expect(error).toBeNull()
      expect(data).toEqual([])
    })

    it("should delete a student from the database", async () => {
      if (!createdStudentId) {
        throw new Error("No student created for delete test")
      }

      const { error } = await supabase.from("students").delete().eq("id", createdStudentId)

      expect(error).toBeNull()

      // Verify the student is deleted
      const { data: deletedStudent } = await supabase.from("students").select("*").eq("id", createdStudentId)

      expect(deletedStudent).toEqual([])

      // Reset the ID so cleanup doesn't try to delete again
      createdStudentId = ""
    })
  })

  describe("Database Performance and Reliability", () => {
    it("should handle concurrent operations", async () => {
      const students = Array.from({ length: 5 }, (_, i) => ({
        name: `Concurrent Test Student ${i}`,
        age: 20 + i,
        course: "Mathematics",
      }))

      // Create multiple students concurrently
      const createPromises = students.map((student) => supabase.from("students").insert([student]).select())

      const results = await Promise.all(createPromises)

      // All operations should succeed
      results.forEach(({ error, data }) => {
        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data).toHaveLength(1)
      })

      // Cleanup
      const createdIds = results.filter((result) => result.data?.[0]).map((result) => result.data![0].id)

      if (createdIds.length > 0) {
        const { error: deleteError } = await supabase.from("students").delete().in("id", createdIds)

        expect(deleteError).toBeNull()
      }
    })

    it("should handle large result sets", async () => {
      const { data, error } = await supabase.from("students").select("*").limit(1000)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })

    it("should handle pagination", async () => {
      const { data: firstPage, error: firstError } = await supabase
        .from("students")
        .select("*")
        .range(0, 9)
        .order("created_at", { ascending: false })

      expect(firstError).toBeNull()
      expect(firstPage).toBeDefined()
      expect(Array.isArray(firstPage)).toBe(true)

      const { data: secondPage, error: secondError } = await supabase
        .from("students")
        .select("*")
        .range(10, 19)
        .order("created_at", { ascending: false })

      expect(secondError).toBeNull()
      expect(Array.isArray(secondPage)).toBe(true)
    })
  })

  describe("Error Handling", () => {
    it("should handle throwIfSupabaseError utility", () => {
      const mockError = {
        message: "Test error message",
        details: "Test details",
        code: "TEST_ERROR",
      }

      expect(() => throwIfSupabaseError(mockError)).toThrow("Test error message")
      expect(() => throwIfSupabaseError(null)).not.toThrow()
      expect(() => throwIfSupabaseError(undefined)).not.toThrow()
    })

    it("should handle database constraint violations", async () => {
      // Try to insert invalid data that should violate constraints
      const invalidStudent = {
        name: "", // Empty name should fail
        age: -1, // Negative age should fail
        course: "Test Course",
      }

      const { data, error } = await supabase.from("students").insert([invalidStudent]).select()

      // We expect this to fail due to constraints
      expect(error).toBeDefined()
      expect(data).toBeNull()
    })
  })
})
