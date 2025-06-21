import { cn } from "@/lib/utils"
import { throwIfSupabaseError } from "@/lib/supabase"

describe("Utility Functions", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      const result = cn("text-red-500", "bg-blue-500")
      expect(result).toContain("text-red-500")
      expect(result).toContain("bg-blue-500")
    })

    it("should handle conditional classes", () => {
      const isActive = true
      const result = cn("base-class", isActive && "active-class")
      expect(result).toContain("base-class")
      expect(result).toContain("active-class")
    })

    it("should handle undefined and null values", () => {
      const result = cn("base-class", undefined, null, "another-class")
      expect(result).toContain("base-class")
      expect(result).toContain("another-class")
    })

    it("should override conflicting Tailwind classes", () => {
      const result = cn("text-red-500", "text-blue-500")
      expect(result).toContain("text-blue-500")
      expect(result).not.toContain("text-red-500")
    })
  })

  describe("throwIfSupabaseError function", () => {
    it("should not throw when error is null", () => {
      expect(() => throwIfSupabaseError(null)).not.toThrow()
    })

    it("should not throw when error is undefined", () => {
      expect(() => throwIfSupabaseError(undefined)).not.toThrow()
    })

    it("should throw Error with message when Supabase error exists", () => {
      const supabaseError = {
        message: "Database connection failed",
        details: "Connection timeout",
        code: "CONNECTION_ERROR",
      }

      expect(() => throwIfSupabaseError(supabaseError)).toThrow("Database connection failed")
    })

    it("should throw generic error when message is missing", () => {
      const supabaseError = {
        details: "Some details",
        code: "UNKNOWN_ERROR",
      }

      expect(() => throwIfSupabaseError(supabaseError)).toThrow("Unknown Supabase error")
    })
  })
})
