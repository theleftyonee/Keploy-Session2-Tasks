"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Users, GraduationCap, TrendingUp, Loader2 } from "lucide-react"
import { supabase, type Student } from "@/lib/supabase"
import { toast } from "sonner"
import { throwIfSupabaseError } from "@/lib/utils"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"]

export default function Analytics() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*")
      throwIfSupabaseError(error)
      setStudents(data ?? [])
    } catch (error) {
      toast.error("Failed to fetch analytics data")
      console.error(error)
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

  const totalStudents = students.length
  const averageAge = totalStudents > 0 ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / totalStudents) : 0

  const courseDistribution = Object.entries(
    students.reduce(
      (acc, student) => {
        acc[student.course] = (acc[student.course] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([course, count]) => ({ course, count }))

  const mostPopularCourse =
    courseDistribution.length > 0 ? courseDistribution.sort((a, b) => b.count - a.count)[0].course : "N/A"

  const pieData = courseDistribution.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Analytics</h1>
        <p className="text-gray-600 mt-2">Insights and statistics about your students</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{averageAge}</div>
            <p className="text-xs text-muted-foreground">Years old</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Course</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{mostPopularCourse}</div>
            <p className="text-xs text-muted-foreground">Most enrolled</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Students by Course (Bar Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            {courseDistribution.length > 0 ? (
              <ChartContainer
                config={{
                  count: {
                    label: "Students",
                    color: "#3B82F6",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseDistribution}>
                    <XAxis dataKey="course" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Distribution (Pie Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ChartContainer
                config={{
                  count: {
                    label: "Students",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ course, count, percent }) => `${course}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(
                students.reduce(
                  (acc, student) => {
                    const ageGroup =
                      student.age < 20 ? "Under 20" : student.age < 25 ? "20-24" : student.age < 30 ? "25-29" : "30+"
                    acc[ageGroup] = (acc[ageGroup] || 0) + 1
                    return acc
                  },
                  {} as Record<string, number>,
                ),
              ).map(([ageGroup, count]) => (
                <div key={ageGroup} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600">{ageGroup}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No age data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
