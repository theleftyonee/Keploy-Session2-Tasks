"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { supabase, type Student } from "@/lib/supabase"
import { Loader2, AlertTriangle } from "lucide-react"
import { throwIfSupabaseError } from "@/lib/utils"

interface DeleteStudentModalProps {
  student: Student | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteStudentModal({ student, open, onClose, onSuccess }: DeleteStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!student) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("students").delete().eq("id", student.id)
      throwIfSupabaseError(error)

      toast.success("Student deleted successfully!")
      onSuccess()
      onClose()
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to delete student")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Delete Student</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{student?.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
