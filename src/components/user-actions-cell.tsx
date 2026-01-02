"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Power, PowerOff } from "lucide-react"
import { IUser } from "@/interfaces"
import { toggleUserStatus } from "@/actions/manage-users"
import toast from "react-hot-toast"

interface UserActionsCellProps {
  user: Omit<IUser, 'password'>
  onEdit: () => void
  onDelete: () => void
  onStatusChange: () => void
}

export default function UserActionsCell({
  user,
  onEdit,
  onDelete,
  onStatusChange,
}: UserActionsCellProps) {
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true)

    try {
      const result = await toggleUserStatus(user.id, user.is_active)

      if (result.success) {
        toast.success(result.message || "User status updated")
        onStatusChange()
      } else {
        toast.error(result.message || "Failed to update status")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsTogglingStatus(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="gap-2"
      >
        <Edit className="w-4 h-4" />
        Edit
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleStatus}
        disabled={isTogglingStatus}
        className="gap-2"
        title={user.is_active ? "Deactivate user" : "Activate user"}
      >
        {user.is_active ? (
          <>
            <PowerOff className="w-4 h-4" />
            Deactivate
          </>
        ) : (
          <>
            <Power className="w-4 h-4" />
            Activate
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>
    </div>
  )
}
