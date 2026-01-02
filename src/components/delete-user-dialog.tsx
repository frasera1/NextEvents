"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteUser } from "@/actions/manage-users"
import toast from "react-hot-toast"
import { AlertTriangle } from "lucide-react"

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  onSuccess: () => void
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const result = await deleteUser(userId)

      if (result.success) {
        toast.success(result.message || "User deleted successfully")
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(result.message || "Failed to delete user")
      }
    } catch (error) {
      toast.error("An error occurred while deleting user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Delete User</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 p-4">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Important Notice
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                Users with existing bookings cannot be deleted. You'll need to cancel or reassign their bookings first.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
