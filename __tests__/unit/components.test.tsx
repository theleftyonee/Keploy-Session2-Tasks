"use client"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Navigation } from "@/components/navigation"
import { StudentTable } from "@/components/student-table"
import { EditStudentModal } from "@/components/edit-student-modal"
import { DeleteStudentModal } from "@/components/delete-student-modal"
import type { Student } from "@/lib/supabase"

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}))

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
    })),
  },
  throwIfSupabaseError: jest.fn(),
}))

describe("Component Tests", () => {
  describe("Navigation Component", () => {
    it("should render navigation links", () => {
      render(<Navigation />)

      expect(screen.getByText("Dashboard")).toBeInTheDocument()
      expect(screen.getByText("Add Student")).toBeInTheDocument()
      expect(screen.getByText("Search")).toBeInTheDocument()
      expect(screen.getByText("Analytics")).toBeInTheDocument()
    })

    it("should have correct href attributes", () => {
      render(<Navigation />)

      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/")
      expect(screen.getByRole("link", { name: "Add Student" })).toHaveAttribute("href", "/add-student")
      expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute("href", "/search")
      expect(screen.getByRole("link", { name: "Analytics" })).toHaveAttribute("href", "/analytics")
    })
  })

  describe("StudentTable Component", () => {
    const mockStudents: Student[] = [
      { id: "1", name: "John Doe", age: 20, course: "Computer Science", created_at: "2024-01-01" },
      { id: "2", name: "Jane Smith", age: 22, course: "AI", created_at: "2024-01-02" },
    ]

    it("should render student data", () => {
      render(<StudentTable students={mockStudents} />)

      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("Jane Smith")).toBeInTheDocument()
      expect(screen.getByText("Computer Science")).toBeInTheDocument()
      expect(screen.getByText("AI")).toBeInTheDocument()
    })

    it("should display empty state when no students", () => {
      render(<StudentTable students={[]} />)

      expect(screen.getByText("No students found")).toBeInTheDocument()
    })

    it("should show edit and delete buttons for each student", () => {
      render(<StudentTable students={mockStudents} />)

      const editButtons = screen.getAllByText("Edit")
      const deleteButtons = screen.getAllByText("Delete")

      expect(editButtons).toHaveLength(2)
      expect(deleteButtons).toHaveLength(2)
    })
  })

  describe("EditStudentModal Component", () => {
    const mockStudent: Student = {
      id: "1",
      name: "John Doe",
      age: 20,
      course: "Computer Science",
      created_at: "2024-01-01",
    }

    it("should render with student data pre-filled", () => {
      render(<EditStudentModal student={mockStudent} isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />)

      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument()
      expect(screen.getByDisplayValue("20")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Computer Science")).toBeInTheDocument()
    })

    it("should call onClose when cancel button is clicked", async () => {
      const mockOnClose = jest.fn()

      render(<EditStudentModal student={mockStudent} isOpen={true} onClose={mockOnClose} onSuccess={jest.fn()} />)

      const cancelButton = screen.getByText("Cancel")
      await userEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it("should validate required fields", async () => {
      render(<EditStudentModal student={mockStudent} isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />)

      const nameInput = screen.getByDisplayValue("John Doe")
      await userEvent.clear(nameInput)

      const saveButton = screen.getByText("Save Changes")
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument()
      })
    })
  })

  describe("DeleteStudentModal Component", () => {
    const mockStudent: Student = {
      id: "1",
      name: "John Doe",
      age: 20,
      course: "Computer Science",
      created_at: "2024-01-01",
    }

    it("should display student name in confirmation message", () => {
      render(<DeleteStudentModal student={mockStudent} isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />)

      expect(screen.getByText(/Are you sure you want to delete John Doe/)).toBeInTheDocument()
    })

    it("should call onClose when cancel button is clicked", async () => {
      const mockOnClose = jest.fn()

      render(<DeleteStudentModal student={mockStudent} isOpen={true} onClose={mockOnClose} onSuccess={jest.fn()} />)

      const cancelButton = screen.getByText("Cancel")
      await userEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it("should show loading state when deleting", async () => {
      render(<DeleteStudentModal student={mockStudent} isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />)

      const deleteButton = screen.getByText("Delete")
      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText("Deleting...")).toBeInTheDocument()
      })
    })
  })
})
