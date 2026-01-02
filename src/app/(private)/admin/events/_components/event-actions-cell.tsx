'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Edit, Ticket, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { deleteEventById } from '@/actions/events'

interface EventActionsCellProps {
  eventId: number | undefined
}

export default function EventActionsCell({ eventId }: EventActionsCellProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!eventId) return

    const confirmDelete = window.confirm("Are you sure you want to delete this event?")
    if (!confirmDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteEventById(eventId)
      if (result.success) {
        toast.success("Event deleted successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to delete event")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the event")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!eventId) return null

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/events/edit/${eventId}`}>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </Link>
      <Link href={`/admin/events/tickets/${eventId}`}>
        <Button variant="outline" size="sm" className="gap-2">
          <Ticket className="w-4 h-4" />
          Tickets
        </Button>
      </Link>
      <Button 
        variant="destructive" 
        size="sm" 
        className="gap-2"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  )
}
