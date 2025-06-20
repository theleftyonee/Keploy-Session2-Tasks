"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentTable } from "@/components/student-table"
import { supabase, type Student } from "@/lib/supabase"
import { toast } from "sonner"
import { throwIfSupabaseError } from "@/lib/utils"

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })
      throwIfSupabaseError(error)

      /* If the table hasn’t been created yet, `data` is `null`.
         We treat it as “no students” so the UI still loads. */
      setStudents(data ?? [])
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to fetch students")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Guide if the table hasn’t been created */}
      {students === null && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          The <code className="font-mono">students</code> table doesn&apos;t exist in your Supabase project. Run&nbsp;
          <code className="font-mono">scripts/create-students-table.sql</code> in the Supabase SQL editor (or click
          &quot;Run script&quot; in the Steps pane) and reload the page.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Students</h1>
          <p className="text-gray-600 mt-2">Manage and view all registered students</p>
        </div>
        <Link href="/add-student">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Student
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Years old</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Course</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0
                ? Object.entries(
                    students.reduce(
                      (acc, s) => {
                        acc[s.course] = (acc[s.course] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Most enrolled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTable students={students} onStudentUpdated={fetchStudents} />
        </CardContent>
      </Card>

      {/* Floating Action Button for Mobile */}
      <Link href="/add-student" className="md:hidden">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
