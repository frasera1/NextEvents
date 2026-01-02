'use server'

import { createSupabaseClient } from "@/config/supabase-config"

export const uploadFilesAndGetUrls = async (formData: FormData) => {
  try {
    const files = formData.getAll('files') as File[]
    const supabase = await createSupabaseClient()
    const uploadedFileUrls: string[] = []

    for (const file of files) {
      // Create a unique filename using timestamp and random string
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 9)
      const fileExtension = file.name.split('.').pop()
      const uniqueFileName = `${timestamp}-${random}.${fileExtension}`

      // Upload file to Supabase bucket
      const { data, error } = await supabase.storage
        .from('events')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`)
      }

      // Get public URL for the uploaded file
      const { data: publicUrl } = supabase.storage
        .from('events')
        .getPublicUrl(uniqueFileName)

      if (publicUrl.publicUrl) {
        uploadedFileUrls.push(publicUrl.publicUrl)
      }
    }

    return {
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFileUrls
    }
  } catch (error) {
    return {
      success: false,
      message: "File upload failed: " + (error as Error).message
    }
  }
}

export const uploadAvatarAndGetUrl = async (formData: FormData) => {
  try {
    const file = formData.get('avatar') as File

    if (!file) {
      throw new Error("No file provided")
    }

    const supabase = await createSupabaseClient()

    // Create a unique filename using timestamp and random string
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${timestamp}-${random}.${fileExtension}`

    // Upload file to Supabase bucket
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`)
    }

    // Get public URL for the uploaded file
    const { data: publicUrl } = supabase.storage
      .from('avatars')
      .getPublicUrl(uniqueFileName)

    if (!publicUrl.publicUrl) {
      throw new Error("Failed to get public URL")
    }

    return {
      success: true,
      message: "Avatar uploaded successfully",
      data: publicUrl.publicUrl
    }
  } catch (error) {
    return {
      success: false,
      message: "Avatar upload failed: " + (error as Error).message
    }
  }
}
