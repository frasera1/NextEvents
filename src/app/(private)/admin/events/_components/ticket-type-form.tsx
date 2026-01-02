"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTicketType, updateTicketType } from "@/actions/events-ticket-types"
import { IEventTicketType } from "@/interfaces"
import { useRouter } from "next/navigation"
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  total_tickets: z.number().min(1, "Total tickets must be at least 1"),
})

type TicketTypeFormData = z.infer<typeof schema>

interface TicketTypeFormProps {
  eventId: number
  initialData?: IEventTicketType
  onClose: () => void
}

export default function TicketTypeForm({ eventId, initialData, onClose }: TicketTypeFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<TicketTypeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      total_tickets: initialData?.total_tickets || 0,
    },
  })

  const onSubmit = async (data: TicketTypeFormData) => {
    setLoading(true)
    try {
      let response
      if (initialData) {
        // Calculate the difference in total tickets to adjust available tickets
        const ticketDifference = data.total_tickets - (initialData.total_tickets || 0)
        
        response = await updateTicketType(initialData.id, {
            ...data,
            available_tickets: (initialData.available_tickets || 0) + ticketDifference
        })
      } else {
        response = await createTicketType({
          ...data,
          event_id: eventId,
          booked_tickets: 0,
          available_tickets: data.total_tickets,
        })
      }

      if (response.success) {
        toast.success(response.message)
        router.refresh()
        onClose()
      } else {
        toast.error(response.message)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
        {errors.price && <span className="text-sm text-red-500">{errors.price.message}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="total_tickets">Total Tickets</Label>
        <Input id="total_tickets" type="number" {...register("total_tickets", { valueAsNumber: true })} />
        {errors.total_tickets && <span className="text-sm text-red-500">{errors.total_tickets.message}</span>}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}