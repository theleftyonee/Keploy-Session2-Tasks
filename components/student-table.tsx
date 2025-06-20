"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Student } from "@/lib/supabase"
import { EditStudentModal } from "./edit-student-modal"
import { DeleteStudentModal } from "./delete-student-modal"

interface StudentTableProps {
  students: Student[]
  onStudentUpdated: () => void
}

export function StudentTable({ students, onStudentUpdated }: StudentTableProps) {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)

  const getCourseColor = (course: string) => {
    const colors: Record<string, string> = {
      "Computer Science": "bg-blue-100 text-blue-800",
      AI: "bg-purple-100 text-purple-800",
      Biology: "bg-green-100 text-green-800",
      Mathematics: "bg-yellow-100 text-yellow-800",
      Physics: "bg-red-100 text-red-800",
    }
    return colors[course] || "bg-gray-100 text-gray-800"
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No students found. Add your first student to get started.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>
                    <Badge className={getCourseColor(student.course)}>{student.course}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(student.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingStudent(student)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditStudentModal
        student={editingStudent}
        open={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={onStudentUpdated}
      />

      <DeleteStudentModal
        student={deletingStudent}
        open={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onSuccess={onStudentUpdated}
      />
    </>
  )
}
