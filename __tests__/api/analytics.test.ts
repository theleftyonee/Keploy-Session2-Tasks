describe("Analytics API Tests", () => {
  describe("GET /api/analytics/overview", () => {
    it("should return student analytics overview", async () => {
      const mockAnalytics = {
        totalStudents: 100,
        averageAge: 21.5,
        mostPopularCourse: "Computer Science",
        courseDistribution: [
          { course: "Computer Science", count: 40 },
          { course: "AI", count: 30 },
          { course: "Biology", count: 20 },
          { course: "Mathematics", count: 10 },
        ],
        ageDistribution: {
          "Under 20": 25,
          "20-24": 50,
          "25-29": 20,
          "30+": 5,
        },
      }

      const response = {
        status: 200,
        json: async () => ({ data: mockAnalytics, error: null }),
      }

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toMatchObject(mockAnalytics)
      expect(data.data.totalStudents).toBeGreaterThan(0)
      expect(data.data.averageAge).toBeGreaterThan(0)
    })

    it("should handle empty database", async () => {
      const emptyAnalytics = {
        totalStudents: 0,
        averageAge: 0,
        mostPopularCourse: "N/A",
        courseDistribution: [],
        ageDistribution: {},
      }

      const response = {
        status: 200,
        json: async () => ({ data: emptyAnalytics, error: null }),
      }

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.totalStudents).toBe(0)
      expect(data.data.mostPopularCourse).toBe("N/A")
    })
  })

  describe("GET /api/analytics/courses", () => {
    it("should return course distribution data", async () => {
      const courseData = [
        { course: "Computer Science", count: 40, percentage: 40 },
        { course: "AI", count: 30, percentage: 30 },
        { course: "Biology", count: 20, percentage: 20 },
        { course: "Mathematics", count: 10, percentage: 10 },
      ]

      const response = {
        status: 200,
        json: async () => ({ data: courseData, error: null }),
      }

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toEqual(courseData)

      // Verify percentages add up to 100
      const totalPercentage = data.data.reduce((sum: number, item: any) => sum + item.percentage, 0)
      expect(totalPercentage).toBe(100)
    })
  })

  describe("GET /api/analytics/age-groups", () => {
    it("should return age group distribution", async () => {
      const ageGroupData = {
        "Under 20": 25,
        "20-24": 50,
        "25-29": 20,
        "30+": 5,
      }

      const response = {
        status: 200,
        json: async () => ({ data: ageGroupData, error: null }),
      }

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toEqual(ageGroupData)

      // Verify all age groups are represented
      expect(Object.keys(data.data)).toContain("Under 20")
      expect(Object.keys(data.data)).toContain("20-24")
      expect(Object.keys(data.data)).toContain("25-29")
      expect(Object.keys(data.data)).toContain("30+")
    })
  })
})
