"use client"

import useUsersStore, { UsersStore } from "@/store/user-store"
import { formatDateTime } from "@/lib/utils"
import { User, Mail, Shield, Calendar, CheckCircle, XCircle, Image as ImageIcon, Lock, Camera } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import ChangePasswordDialog from "@/components/change-password-dialog"
import ChangeProfilePictureDialog from "@/components/change-profile-picture-dialog"

export default function ProfileCard() {
  const { user } = useUsersStore() as UsersStore
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPictureDialog, setShowPictureDialog] = useState(false)

  if (!user) {
    return (
      <div className="rounded-lg border border-border p-6 bg-card">
        <p className="text-muted-foreground">No user data available</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border p-6 bg-card space-y-6">
        {/* Header with Avatar and Name */}
        <div className="flex items-start gap-6">
          <div className="relative">
            {user.avatar ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20">
                <Image
                  src={user.avatar}
                  alt={user.name || "User avatar"}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <User className="w-12 h-12 text-primary/60" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {user.name || "Unknown User"}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === "admin"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}
              >
                {user.role || "user"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${user.is_active
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-900/10 text-red-900 border border-red-900/20"
                  }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User ID */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm mb-1">User ID</p>
                <p className="text-muted-foreground text-sm break-all">{user.id || "-"}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm mb-1">Email</p>
                <p className="text-muted-foreground text-sm break-all">{user.email || "-"}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm mb-1">Role</p>
                <p className="text-muted-foreground text-sm capitalize">{user.role || "-"}</p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-start gap-3">
              {user.is_active ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-900 mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm mb-1">Account Status</p>
                <p
                  className={`text-sm ${user.is_active ? "text-green-600" : "text-red-900"
                    }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm mb-1">Member Since</p>
                <p className="text-muted-foreground text-sm">
                  {user.created_at ? formatDateTime(user.created_at) : "-"}
                </p>
              </div>
            </div>

            {/* Avatar URL (if available) */}
            {user.avatar && (
              <div className="flex items-start gap-3">
                <ImageIcon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm mb-1">Avatar URL</p>
                  <p className="text-muted-foreground text-xs break-all truncate">
                    {user.avatar}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-border justify-end">
          <Button
            onClick={() => setShowPictureDialog(true)}
            variant="default"
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            Change Profile Picture
          </Button>
          <Button
            onClick={() => setShowPasswordDialog(true)}
            variant="default"
            className="gap-2"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
      <ChangeProfilePictureDialog
        open={showPictureDialog}
        onOpenChange={setShowPictureDialog}
      />
    </>
  )
}

