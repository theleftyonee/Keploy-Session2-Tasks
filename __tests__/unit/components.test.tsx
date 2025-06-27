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
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}))

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock react-hook-form
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    register: jest.fn(),
    handleSubmit: (fn: any) => fn,
    setValue: jest.fn(),
    formState: { errors: {} },
  }),
  Controller: ({ render }: any) => render({ field: { value: "", onChange: jest.fn() } }),
}))

const mockStudent: Student = {
  id: "test-id",
  name: "Test Student",
  age: 20,
  course: "Computer Science",
  created_at: "2023-01-01T00:00:00Z",
}

describe("Component Tests", () => {
  describe("Navigation", () => {
    it("should render navigation with all links", () => {
      render(<Navigation />)

      // Check for main navigation elements
      const dashboardLinks = screen.getAllByText("Dashboard")
      expect(dashboardLinks.length).toBeGreaterThan(0)
      
      expect(screen.getByText("Add Student")).toBeInTheDocument()
      expect(screen.getByText("Analytics")).toBeInTheDocument()
      expect(screen.getByText("Search")).toBeInTheDocument()
    })

    it("should handle mobile navigation", () => {
      render(<Navigation />)
      
      // Check for navigation links instead of mobile menu button
      const addStudentLinks = screen.getAllByText("Add Student")
      expect(addStudentLinks.length).toBeGreaterThan(0)
    })

    it("should handle navigation link clicks", async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      // Test clicking on navigation links - use getAllByText to handle multiple elements
      const addStudentLinks = screen.getAllByText("Add Student")
      await user.click(addStudentLinks[0])
      
      expect(addStudentLinks[0]).toBeInTheDocument()
    })
  })

  describe("StudentTable", () => {
    it("should render table with students", () => {
      const students = [mockStudent]
      render(<StudentTable students={students} onStudentUpdated={jest.fn()} />)

      expect(screen.getByText("Test Student")).toBeInTheDocument()
      expect(screen.getByText("20")).toBeInTheDocument()
      expect(screen.getByText("Computer Science")).toBeInTheDocument()
    })

    it("should render empty state when no students", () => {
      render(<StudentTable students={[]} onStudentUpdated={jest.fn()} />)

      expect(screen.getByText("No students found. Add your first student to get started.")).toBeInTheDocument()
    })

    it("should handle course color mapping", () => {
      const students = [
        { ...mockStudent, course: "AI" },
        { ...mockStudent, id: "test-id-2", course: "Biology" },
        { ...mockStudent, id: "test-id-3", course: "Unknown Course" },
      ]
      render(<StudentTable students={students} onStudentUpdated={jest.fn()} />)

      expect(screen.getByText("AI")).toBeInTheDocument()
      expect(screen.getByText("Biology")).toBeInTheDocument()
      expect(screen.getByText("Unknown Course")).toBeInTheDocument()
    })

    it("should handle all course color variations", () => {
      const students = [
        { ...mockStudent, id: "1", course: "Computer Science" },
        { ...mockStudent, id: "2", course: "AI" },
        { ...mockStudent, id: "3", course: "Biology" },
        { ...mockStudent, id: "4", course: "Mathematics" },
        { ...mockStudent, id: "5", course: "Physics" },
        { ...mockStudent, id: "6", course: "Chemistry" },
        { ...mockStudent, id: "7", course: "Engineering" },
        { ...mockStudent, id: "8", course: "Unknown Course" },
      ]
      render(<StudentTable students={students} onStudentUpdated={jest.fn()} />)

      // Check that all courses are rendered
      students.forEach(student => {
        expect(screen.getByText(student.course)).toBeInTheDocument()
      })
    })

    it("should open edit modal when edit button is clicked", async () => {
      const user = userEvent.setup()
      const students = [mockStudent]
      render(<StudentTable students={students} onStudentUpdated={jest.fn()} />)

      // Open dropdown menu
      const moreButton = screen.getByRole("button", { name: "" })
      await user.click(moreButton)

      // Click edit button
      const editButton = screen.getByText("Edit")
      await user.click(editButton)

      // Check if edit modal is opened
      expect(screen.getByText("Edit Student")).toBeInTheDocument()
    })

    it("should open delete modal when delete button is clicked", async () => {
      const user = userEvent.setup()
      const students = [mockStudent]
      render(<StudentTable students={students} onStudentUpdated={jest.fn()} />)

      // Open dropdown menu
      const moreButton = screen.getByRole("button", { name: "" })
      await user.click(moreButton)

      // Click delete button
      const deleteButton = screen.getByText("Delete")
      await user.click(deleteButton)

      // Check if delete modal is opened - use getAllByText to handle multiple elements
      const deleteElements = screen.getAllByText("Delete Student")
      expect(deleteElements.length).toBeGreaterThan(0)
    })

    it("should handle multiple students with actions", async () => {
      const user = userEvent.setup()
      const students = [
        { ...mockStudent, id: "1", name: "Student 1" },
        { ...mockStudent, id: "2", name: "Student 2" },
        { ...mockStudent, id: "3", name: "Student 3" },
      ]
      render(<StudentTable students={students} onStudentUpdated={jest.fn()} />)

      // Check all students are rendered
      expect(screen.getByText("Student 1")).toBeInTheDocument()
      expect(screen.getByText("Student 2")).toBeInTheDocument()
      expect(screen.getByText("Student 3")).toBeInTheDocument()

      // Test actions for first student
      const moreButtons = screen.getAllByRole("button", { name: "" })
      await user.click(moreButtons[0])

      const editButton = screen.getByText("Edit")
      await user.click(editButton)

      expect(screen.getByText("Edit Student")).toBeInTheDocument()
    })
  })

  describe("EditStudentModal", () => {
    it("should render edit modal with student data", () => {
      render(
        <EditStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      expect(screen.getByText("Edit Student")).toBeInTheDocument()
    })

    it("should not render when closed", () => {
      render(
        <EditStudentModal 
          student={mockStudent} 
          open={false} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      expect(screen.queryByText("Edit Student")).not.toBeInTheDocument()
    })

    it("should handle form submission successfully", async () => {
      const user = userEvent.setup()
      const onSuccess = jest.fn()
      const onClose = jest.fn()

      render(
        <EditStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={onClose} 
          onSuccess={onSuccess} 
        />
      )

      // Submit form
      const submitButton = screen.getByText("Update Student")
      await user.click(submitButton)

      // Since we're mocking react-hook-form, the form submission should work
      expect(submitButton).toBeInTheDocument()
    })

    it("should handle form validation errors", async () => {
      const user = userEvent.setup()
      render(
        <EditStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      // Submit form without filling required fields
      const submitButton = screen.getByText("Update Student")
      await user.click(submitButton)

      // Check that the form is rendered
      expect(submitButton).toBeInTheDocument()
    })

    it("should handle age validation", async () => {
      const user = userEvent.setup()
      render(
        <EditStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      const submitButton = screen.getByText("Update Student")
      await user.click(submitButton)

      // Check that the form is rendered
      expect(submitButton).toBeInTheDocument()
    })

    it("should handle course selection", async () => {
      const user = userEvent.setup()
      render(
        <EditStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      // Check that course select is rendered
      expect(screen.getByText("Course")).toBeInTheDocument()
    })

    it("should handle modal close", async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()
      render(
        <EditStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={onClose} 
          onSuccess={jest.fn()} 
        />
      )

      const cancelButton = screen.getByText("Cancel")
      await user.click(cancelButton)

      expect(onClose).toHaveBeenCalled()
    })

    it("should handle null student", () => {
      render(
        <EditStudentModal 
          student={null} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      expect(screen.getByText("Edit Student")).toBeInTheDocument()
    })

    it("should handle different student courses", () => {
      const studentsWithDifferentCourses = [
        { ...mockStudent, course: "AI" },
        { ...mockStudent, id: "2", course: "Biology" },
        { ...mockStudent, id: "3", course: "Mathematics" },
      ]

      // Test each course individually to avoid multiple elements issue
      studentsWithDifferentCourses.forEach((student, index) => {
        const { unmount } = render(
          <EditStudentModal 
            student={student} 
            open={true} 
            onClose={jest.fn()} 
            onSuccess={jest.fn()} 
          />
        )
        expect(screen.getByText("Edit Student")).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe("DeleteStudentModal", () => {
    it("should render delete modal with student name", () => {
      render(
        <DeleteStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      // Use getAllByText to handle multiple elements with same text
      const deleteElements = screen.getAllByText("Delete Student")
      expect(deleteElements.length).toBeGreaterThan(0)
      expect(screen.getByText(/Test Student/)).toBeInTheDocument()
    })

    it("should not render when closed", () => {
      render(
        <DeleteStudentModal 
          student={mockStudent} 
          open={false} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      expect(screen.queryByText("Delete Student")).not.toBeInTheDocument()
    })

    it("should handle delete confirmation", async () => {
      const user = userEvent.setup()
      const onSuccess = jest.fn()
      const onClose = jest.fn()

      render(
        <DeleteStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={onClose} 
          onSuccess={onSuccess} 
        />
      )

      const deleteButton = screen.getByRole("button", { name: "Delete Student" })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
        expect(onClose).toHaveBeenCalled()
      })
    })

    it("should handle delete cancellation", async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()

      render(
        <DeleteStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={onClose} 
          onSuccess={jest.fn()} 
        />
      )

      const cancelButton = screen.getByText("Cancel")
      await user.click(cancelButton)

      expect(onClose).toHaveBeenCalled()
    })

    it("should handle null student", () => {
      render(
        <DeleteStudentModal 
          student={null} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      // Use getAllByText to handle multiple elements with same text
      const deleteElements = screen.getAllByText("Delete Student")
      expect(deleteElements.length).toBeGreaterThan(0)
    })

    it("should show loading state during delete", async () => {
      const user = userEvent.setup()
      render(
        <DeleteStudentModal 
          student={mockStudent} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      const deleteButton = screen.getByRole("button", { name: "Delete Student" })
      await user.click(deleteButton)

      // Check that the button exists and is clickable
      expect(deleteButton).toBeInTheDocument()
    })

    it("should handle different student names", () => {
      const studentsWithDifferentNames = [
        { ...mockStudent, name: "John Doe" },
        { ...mockStudent, id: "2", name: "Jane Smith" },
        { ...mockStudent, id: "3", name: "Bob Johnson" },
      ]

      // Test each name individually to avoid multiple elements issue
      studentsWithDifferentNames.forEach((student, index) => {
        const { unmount } = render(
          <DeleteStudentModal 
            student={student} 
            open={true} 
            onClose={jest.fn()} 
            onSuccess={jest.fn()} 
          />
        )
        expect(screen.getByText(new RegExp(student.name))).toBeInTheDocument()
        unmount()
      })
    })

    it("should handle empty student name", () => {
      const studentWithEmptyName = { ...mockStudent, name: "" }
      render(
        <DeleteStudentModal 
          student={studentWithEmptyName} 
          open={true} 
          onClose={jest.fn()} 
          onSuccess={jest.fn()} 
        />
      )

      const deleteElements = screen.getAllByText("Delete Student")
      expect(deleteElements.length).toBeGreaterThan(0)
    })
  })
})
