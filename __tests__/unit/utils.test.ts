import { cn } from "@/lib/utils"
import { throwIfSupabaseError } from "@/lib/utils"

describe("Utility Functions", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      const result = cn("px-2 py-1", "bg-red-500", "text-white")
      expect(result).toBe("px-2 py-1 bg-red-500 text-white")
    })

    it("should handle conditional classes", () => {
      const isActive = true
      const result = cn("base-class", isActive && "active-class", !isActive && "inactive-class")
      expect(result).toBe("base-class active-class")
    })

    it("should handle empty inputs", () => {
      const result = cn("", null, undefined, false && "hidden")
      expect(result).toBe("")
    })

    it("should handle arrays and objects", () => {
      const result = cn(["class1", "class2"], { "conditional-class": true, "hidden": false })
      expect(result).toBe("class1 class2 conditional-class")
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
      expect(() => throwIfSupabaseError({})).toThrow("{}")
    })

    it("should not throw for table not found error (42P01)", () => {
      const tableNotFoundError = { code: "42P01", message: "relation does not exist" }
      expect(() => throwIfSupabaseError(tableNotFoundError)).not.toThrow()
    })

    it("should throw error with message when provided", () => {
      const error = { message: "Database connection failed" }
      expect(() => throwIfSupabaseError(error)).toThrow("Database connection failed")
    })

    it("should throw error with details when message is not available", () => {
      const error = { details: "Connection timeout" }
      expect(() => throwIfSupabaseError(error)).toThrow("Connection timeout")
    })

    it("should throw pretty-printed JSON when neither message nor details available", () => {
      const error = { code: "500", hint: "Internal server error" }
      expect(() => throwIfSupabaseError(error)).toThrow('{\n  "code": "500",\n  "hint": "Internal server error"\n}')
    })

    it("should handle error with empty message and details", () => {
      const error = { message: "", details: "" }
      expect(() => throwIfSupabaseError(error)).toThrow('{\n  "message": "",\n  "details": ""\n}')
    })

    it("should handle error with whitespace-only message", () => {
      const error = { message: "   ", details: "   " }
      expect(() => throwIfSupabaseError(error)).toThrow('{\n  "message": "   ",\n  "details": "   "\n}')
    })
  })
})
