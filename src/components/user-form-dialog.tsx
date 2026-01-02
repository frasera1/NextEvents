"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUser, updateUser } from "@/actions/manage-users"
import toast from "react-hot-toast"
import { IUser } from "@/interfaces"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Omit<IUser, 'password'> | null
  onSuccess: () => void
}

export default function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<'admin' | 'user'>("user")
  const [isLoading, setIsLoading] = useState(false)

  const isEditMode = !!user

  // Load user data when in edit mode
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setRole(user.role)
      setPassword("") // Don't show existing password
    } else {
      // Reset form for create mode
      setName("")
      setEmail("")
      setPassword("")
      setRole("user")
    }
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Valid email is required")
      return
    }

    if (!isEditMode && !password.trim()) {
      toast.error("Password is required for new users")
      return
    }

    if (!isEditMode && password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      if (isEditMode && user) {
        // Update existing user
        const payload: any = {
          name: name.trim(),
          email: email.trim(),
          role,
        }

        // Only include password if provided
        if (password.trim()) {
          if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            setIsLoading(false)
            return
          }
          payload.password = password.trim()
        }

        const result = await updateUser(user.id, payload)

        if (result.success) {
          toast.success(result.message || "User updated successfully")
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.message || "Failed to update user")
        }
      } else {
        // Create new user
        const result = await createUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
        })

        if (result.success) {
          toast.success(result.message || "User created successfully")
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.message || "Failed to create user")
        }
      }
    } catch (error) {
      toast.error("An error occurred")
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
          <DialogTitle>
            {isEditMode ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update user information and role. Leave password empty to keep current password."
              : "Fill in the details below to create a new user account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                disabled={isLoading}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEditMode ? "(leave empty to keep current)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditMode ? "Enter new password (optional)" : "Minimum 8 characters"}
                disabled={isLoading}
                required={!isEditMode}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as 'admin' | 'user')}
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update User"
                  : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
