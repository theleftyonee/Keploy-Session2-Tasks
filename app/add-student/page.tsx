"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { throwIfSupabaseError } from "@/lib/utils"

interface FormData {
  name: string
  age: number
  course: string
}

const courses = ["Computer Science", "AI", "Biology", "Mathematics", "Physics", "Chemistry", "Engineering"]

export default function AddStudent() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name: "", age: undefined, course: "" },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("students").insert([
        {
          name: data.name,
          age: data.age,
          course: data.course,
        },
      ])
      throwIfSupabaseError(error)

      toast.success("Student added successfully!")
      reset()
      router.push("/")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to add student")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add a New Student</h1>
          <p className="text-gray-600 mt-2">Fill in the details to register a new student</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter student's full name"
                className="w-full"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                {...register("age", {
                  required: "Age is required",
                  min: { value: 1, message: "Age must be at least 1" },
                  max: { value: 100, message: "Age must be less than 100" },
                })}
                placeholder="Enter student's age"
                className="w-full"
              />
              {errors.age && <p className="text-sm text-red-600">{errors.age.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Controller
                control={control}
                name="course"
                rules={{ required: "Course is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.course && <p className="text-sm text-red-600">{errors.course.message}</p>}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Student
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
