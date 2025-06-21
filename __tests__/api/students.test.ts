import { supabase } from "@/lib/supabase"

// API Tests - These test the actual API behavior
describe("Student API Tests", () => {
  describe("Student CRUD API Operations", () => {
    let testStudentId: string

    afterAll(async () => {
      // Cleanup any test data
      if (testStudentId) {
        await supabase.from("students").delete().eq("id", testStudentId)
      }
    })

    it("should create a new student via API", async () => {
      const newStudent = {
        name: "API Test Student",
        age: 21,
        course: "Biology",
      }

      // Simulate API call by directly using Supabase
      const { data, error } = await supabase.from("students").insert([newStudent]).select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(1)
      expect(data?.[0]).toMatchObject(newStudent)
      expect(data?.[0].id).toBeDefined()

      if (data?.[0]) {
        testStudentId = data[0].id
      }
    })

    it("should fetch all students via API", async () => {
      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)

      if (data && data.length > 0) {
        // Verify structure of returned data
        const student = data[0]
        expect(student).toHaveProperty("id")
        expect(student).toHaveProperty("name")
        expect(student).toHaveProperty("age")
        expect(student).toHaveProperty("course")
        expect(student).toHaveProperty("created_at")
      }
    })

    it("should update a student via API", async () => {
      if (!testStudentId) {
        throw new Error("No test student available for update")
      }

      const updateData = {
        name: "Updated API Test Student",
        age: 22,
      }

      const { data, error } = await supabase.from("students").update(updateData).eq("id", testStudentId).select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data).toHaveLength(1)
      expect(data?.[0]).toMatchObject(updateData)
    })

    it("should search students by name via API", async () => {
      const searchTerm = "API Test"

      const { data, error } = await supabase.from("students").select("*").ilike("name", `%${searchTerm}%`)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        expect(data.every((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()))).toBe(true)
      }
    })

    it("should filter students by course via API", async () => {
      const course = "Biology"

      const { data, error } = await supabase.from("students").select("*").eq("course", course)

      expect(error).toBeNull()
      expect(data).toBeDefined()

      if (data && data.length > 0) {
        expect(data.every((student) => student.course === course)).toBe(true)
      }
    })

    it("should delete a student via API", async () => {
      if (!testStudentId) {
        throw new Error("No test student available for deletion")
      }

      const { error } = await supabase.from("students").delete().eq("id", testStudentId)

      expect(error).toBeNull()

      // Verify deletion
      const { data: deletedStudent } = await supabase.from("students").select("*").eq("id", testStudentId)

      expect(deletedStudent).toEqual([])
      testStudentId = "" // Reset so cleanup doesn't try again
    })
  })

  describe("API Validation and Error Handling", () => {
    it("should handle invalid student data", async () => {
      const invalidStudent = {
        name: "", // Empty name
        age: -1, // Invalid age
        course: "Test Course",
      }

      const { data, error } = await supabase.from("students").insert([invalidStudent]).select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    it("should handle non-existent student updates", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000"
      const updateData = { name: "Non-existent Student" }

      const { data, error } = await supabase.from("students").update(updateData).eq("id", nonExistentId).select()

      expect(error).toBeNull()
      expect(data).toEqual([]) // No rows affected
    })

    it("should handle non-existent student deletion", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000"

      const { error } = await supabase.from("students").delete().eq("id", nonExistentId)

      expect(error).toBeNull() // Supabase doesn't error on deleting non-existent records
    })
  })

  describe("API Performance Tests", () => {
    it("should handle multiple concurrent requests", async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        supabase.from("students").select("*").limit(10).order("created_at", { ascending: false }),
      )

      const startTime = Date.now()
      const responses = await Promise.all(requests)
      const endTime = Date.now()

      // All requests should succeed
      responses.forEach(({ error, data }) => {
        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(Array.isArray(data)).toBe(true)
      })

      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000)
    })

    it("should handle pagination efficiently", async () => {
      const pageSize = 10
      const startTime = Date.now()

      const { data: firstPage, error: firstError } = await supabase
        .from("students")
        .select("*")
        .range(0, pageSize - 1)
        .order("created_at", { ascending: false })

      const { data: secondPage, error: secondError } = await supabase
        .from("students")
        .select("*")
        .range(pageSize, pageSize * 2 - 1)
        .order("created_at", { ascending: false })

      const endTime = Date.now()

      expect(firstError).toBeNull()
      expect(secondError).toBeNull()
      expect(Array.isArray(firstPage)).toBe(true)
      expect(Array.isArray(secondPage)).toBe(true)

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000)
    })
  })

  describe("API Analytics Operations", () => {
    it("should calculate student statistics", async () => {
      // Get total count
      const { count, error: countError } = await supabase.from("students").select("*", { count: "exact", head: true })

      expect(countError).toBeNull()
      expect(typeof count).toBe("number")

      // Get course distribution
      const { data: courseData, error: courseError } = await supabase.from("students").select("course")

      expect(courseError).toBeNull()
      expect(Array.isArray(courseData)).toBe(true)

      if (courseData && courseData.length > 0) {
        // Calculate course distribution
        const courseDistribution = courseData.reduce(
          (acc, student) => {
            acc[student.course] = (acc[student.course] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        expect(typeof courseDistribution).toBe("object")
        expect(Object.keys(courseDistribution).length).toBeGreaterThan(0)
      }
    })

    it("should calculate age statistics", async () => {
      const { data: ageData, error } = await supabase.from("students").select("age")

      expect(error).toBeNull()
      expect(Array.isArray(ageData)).toBe(true)

      if (ageData && ageData.length > 0) {
        const ages = ageData.map((student) => student.age)
        const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length
        const minAge = Math.min(...ages)
        const maxAge = Math.max(...ages)

        expect(typeof averageAge).toBe("number")
        expect(typeof minAge).toBe("number")
        expect(typeof maxAge).toBe("number")
        expect(averageAge).toBeGreaterThan(0)
        expect(minAge).toBeGreaterThan(0)
        expect(maxAge).toBeGreaterThanOrEqual(minAge)
      }
    })
  })
})
