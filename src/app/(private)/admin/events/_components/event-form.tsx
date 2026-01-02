'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEvent, updateEventById } from '@/actions/events'
import { uploadFilesAndGetUrls } from '@/actions/file-uploads'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  small_description: z.string().min(1, 'Short description is required'),
  full_description: z.string().min(1, 'Full description is required'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  status: z.string().min(1, 'Status is required'),
})

type FormData = z.infer<typeof formSchema>

interface EventFormProps {
  formType: 'create' | 'edit'
  initialData?: Partial<FormData>
  eventId?: number
  existingImages?: string[]
}

function EventForm({ formType, initialData, eventId, existingImages }: EventFormProps) {
  const router = useRouter()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(existingImages || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      small_description: initialData?.small_description || '',
      full_description: initialData?.full_description || '',
      date: initialData?.date || '',
      start_time: initialData?.start_time || '',
      end_time: initialData?.end_time || '',
      location: initialData?.location || '',
      capacity: initialData?.capacity || '',
      status: initialData?.status || '',
    },
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectedImages((prev) => [...prev, ...fileArray])

      fileArray.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    try {
      let imageUrls: string[] = []

      // Upload files if any are selected
      if (selectedImages.length > 0) {
        const formData = new FormData()
        selectedImages.forEach((file) => formData.append('files', file))
        const uploadResult = await uploadFilesAndGetUrls(formData)

        if (!uploadResult.success) {
          throw new Error(uploadResult.message)
        }

        imageUrls = uploadResult.data || []
      }

      // Combine existing images with newly uploaded ones
      const allImages = [...(existingImageUrls || []), ...imageUrls]

      // Create event payload with form data and image URLs
      const eventPayload: Partial<import("@/interfaces").IEvent> = {
        title: data.title,
        small_description: data.small_description,
        full_description: data.full_description,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location,
        capacity: parseInt(data.capacity),
        status: data.status,
        images: allImages,
      }

      let result

      if (formType === 'create') {
        result = await createEvent(eventPayload)
      } else if (formType === 'edit' && eventId) {
        result = await updateEventById(eventId, eventPayload)
      } else {
        throw new Error('Invalid form configuration')
      }

      if (!result.success) {
        throw new Error(result.message)
      }

      toast.success(`Event ${formType === 'create' ? 'created' : 'updated'} successfully!`)
      router.push('/admin/events')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Title
              </label>
              <Input
                {...field}
                id="title"
                type="text"
                placeholder="Event title"
                aria-invalid={fieldState.invalid}
                className={fieldState.invalid ? 'border-red-500' : ''}
              />
              {fieldState.invalid && (
                <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Small Description */}
      <div>
        <Controller
          name="small_description"
          control={form.control}
          render={({ field, fieldState }) => (
            <div>
              <label
                htmlFor="small_description"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Short Description
              </label>
              <Input
                {...field}
                id="small_description"
                type="text"
                placeholder="Brief event description"
                aria-invalid={fieldState.invalid}
                className={fieldState.invalid ? 'border-red-500' : ''}
              />
              {fieldState.invalid && (
                <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Full Description */}
      <div>
        <Controller
          name="full_description"
          control={form.control}
          render={({ field, fieldState }) => (
            <div>
              <label
                htmlFor="full_description"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Full Description
              </label>
              <textarea
                {...field}
                id="full_description"
                placeholder="Detailed event description"
                rows={4}
                aria-invalid={fieldState.invalid}
                className={`w-full px-3 py-2 border rounded-md text-foreground ${fieldState.invalid ? 'border-red-500' : 'border-input'
                  }`}
              />
              {fieldState.invalid && (
                <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Location */}
      <div>
        <Controller
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Location
              </label>
              <Input
                {...field}
                id="location"
                type="text"
                placeholder="Event location"
                aria-invalid={fieldState.invalid}
                className={fieldState.invalid ? 'border-red-500' : ''}
              />
              {fieldState.invalid && (
                <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Date, Start Time, End Time in one row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Date
                </label>
                <Input
                  {...field}
                  id="date"
                  type="date"
                  aria-invalid={fieldState.invalid}
                  className={fieldState.invalid ? 'border-red-500' : ''}
                />
                {fieldState.invalid && (
                  <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Start Time */}
        <div>
          <Controller
            name="start_time"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <label
                  htmlFor="start_time"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Start Time
                </label>
                <Input
                  {...field}
                  id="start_time"
                  type="time"
                  aria-invalid={fieldState.invalid}
                  className={fieldState.invalid ? 'border-red-500' : ''}
                />
                {fieldState.invalid && (
                  <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* End Time */}
        <div>
          <Controller
            name="end_time"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <label
                  htmlFor="end_time"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  End Time
                </label>
                <Input
                  {...field}
                  id="end_time"
                  type="time"
                  aria-invalid={fieldState.invalid}
                  className={fieldState.invalid ? 'border-red-500' : ''}
                />
                {fieldState.invalid && (
                  <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>



      {/* Capacity and Status in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Capacity */}
        <div>
          <Controller
            name="capacity"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Capacity
                </label>
                <Input
                  {...field}
                  id="capacity"
                  type="number"
                  placeholder="Enter event capacity"
                  aria-invalid={fieldState.invalid}
                  className={fieldState.invalid ? 'border-red-500' : ''}
                />
                {fieldState.invalid && (
                  <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Status */}
        <div>
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Status
                </label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="status"
                    aria-invalid={fieldState.invalid}
                    className={fieldState.invalid ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select event status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <p className="text-sm text-red-500 mt-1">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <label
          htmlFor="images"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Event Images
        </label>
        <Input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Select one or multiple images
        </p>
      </div>

      {/* Existing Images */}
      {existingImageUrls.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Existing Images
          </label>
          <div className="flex flex-wrap gap-4">
            {existingImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative">
                <img
                  src={url}
                  alt={`Existing image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute -top-2 -right-2 bg-red-900 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-900/90 text-lg font-bold shadow-md cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Selected Images Preview
          </label>
          <div className="flex flex-wrap gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-900 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-900/90 text-lg font-bold shadow-md cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end w-full gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Submitting...'
            : formType === 'create'
              ? 'Create Event'
              : 'Update Event'}
        </Button>
        <Button type="button" variant="outline">
          Reset
        </Button>
      </div>
    </form>
  )
}

export default EventForm