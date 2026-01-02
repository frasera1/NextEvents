"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { uploadAvatarAndGetUrl } from "@/actions/file-uploads"
import { updateUserAvatar } from "@/actions/users"
import toast from "react-hot-toast"
import { Camera, Upload } from "lucide-react"
import useUsersStore, { UsersStore } from "@/store/user-store"
import Image from "next/image"

interface ChangeProfilePictureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ChangeProfilePictureDialog({
  open,
  onOpenChange,
}: ChangeProfilePictureDialogProps) {
  const { user, setUser } = useUsersStore() as UsersStore
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB")
        return
      }

      setSelectedFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an image")
      return
    }

    if (!user?.id) {
      toast.error("User not found")
      return
    }

    setIsLoading(true)
    try {
      // Upload avatar to storage
      const formData = new FormData()
      formData.append("avatar", selectedFile)

      const uploadResult = await uploadAvatarAndGetUrl(formData)

      if (!uploadResult.success || !uploadResult.data) {
        toast.error(uploadResult.message || "Failed to upload image")
        setIsLoading(false)
        return
      }

      // Update user avatar URL in database
      const updateResult = await updateUserAvatar(user.id, uploadResult.data)

      if (updateResult.success) {
        toast.success(updateResult.message || "Profile picture updated successfully")

        // Update user store with new avatar
        setUser({
          ...user,
          avatar: uploadResult.data
        })

        // Reset state and close dialog
        setSelectedFile(null)
        setPreviewUrl(null)
        onOpenChange(false)
      } else {
        toast.error(updateResult.message || "Failed to update profile picture")
      }
    } catch (error) {
      toast.error("An error occurred while updating profile picture")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFile(null)
      setPreviewUrl(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <DialogTitle>Change Profile Picture</DialogTitle>
          </div>
          <DialogDescription>
            Upload a new profile picture. Images must be less than 5MB.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Current avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-primary/40" />
                </div>
              )}
            </div>
          </div>

          {/* File Input */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {selectedFile ? "Change Image" : "Select Image"}
            </Button>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                {selectedFile.name}
              </p>
            )}
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
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? "Uploading..." : "Update Picture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
