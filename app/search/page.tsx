"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentTable } from "@/components/student-table"
import { supabase, type Student } from "@/lib/supabase"
import { toast } from "sonner"
import { throwIfSupabaseError } from "@/lib/utils"

const courses = [
  "All Courses",
  "Computer Science",
  "AI",
  "Biology",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Engineering",
]

export default function SearchPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("All Courses")
  const [isLoading, setIsLoading] = useState(true)

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })
      throwIfSupabaseError(error)
      setStudents(data ?? [])
      setFilteredStudents(data ?? [])
    } catch (error) {
      toast.error("Failed to fetch students")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    let filtered = students

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by course
    if (selectedCourse !== "All Courses") {
      filtered = filtered.filter((student) => student.course === selectedCourse)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, selectedCourse])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCourse("All Courses")
  }

  const hasActiveFilters = searchTerm || selectedCourse !== "All Courses"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Students</h1>
        <p className="text-gray-600 mt-2">Find students using filters and search</p>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Enter student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Filter by Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{filteredStudents.length}</strong> student(s) found
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedCourse !== "All Courses" && ` in ${selectedCourse}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Search Results ({filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <StudentTable students={filteredStudents} onStudentUpdated={fetchStudents} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
