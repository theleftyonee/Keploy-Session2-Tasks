"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabase, type Student } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { throwIfSupabaseError } from "@/lib/utils"

interface EditStudentModalProps {
  student: Student | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  age: number
  course: string
}

const courses = ["Computer Science", "AI", "Biology", "Mathematics", "Physics", "Chemistry", "Engineering"]

export function EditStudentModal({ student, open, onClose, onSuccess }: EditStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name: "", age: undefined, course: "" },
  })

  useEffect(() => {
    if (student) {
      setValue("name", student.name)
      setValue("age", student.age)
      setValue("course", student.course)
    }
  }, [student, setValue])

  const onSubmit = async (data: FormData) => {
    if (!student) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("students")
        .update({
          name: data.name,
          age: data.age,
          course: data.course,
        })
        .eq("id", student.id)
      throwIfSupabaseError(error)
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update student")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name", { required: "Name is required" })} placeholder="Enter full name" />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              {...register("age", {
                required: "Age is required",
                min: { value: 1, message: "Age must be at least 1" },
                max: { value: 100, message: "Age must be less than 100" },
              })}
              placeholder="Enter age"
            />
            {errors.age && <p className="text-sm text-red-600">{errors.age.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Controller
              control={control}
              name="course"
              rules={{ required: "Course is required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
