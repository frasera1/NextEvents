'use client'

import { IEvent } from "@/interfaces"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Music } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface EventCardProps {
  event: IEvent
  isLoggedIn: boolean
}

export default function EventCard({ event, isLoggedIn }: EventCardProps) {
  const router = useRouter()

  const handleEventClick = () => {
    if (!isLoggedIn) {
      router.push('/login')
    } else {
      // Navigate to event details page (assuming route like /events/[id])
      router.push(`/events/${event.id}`)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Date TBA"
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "Time TBA"
    // Assuming time is in HH:MM format
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const hasImage = event.images && event.images.length > 0
  const imageUrl = hasImage ? event.images[0] : null

  return (
    <div
      className="rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow bg-card cursor-pointer"
      onClick={handleEventClick}
    >
      {imageUrl ? (
        <div className="h-48 relative">
          <Image
            src={imageUrl}
            alt={event.title || "Event image"}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Music className="w-12 h-12 text-primary/40" />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-2">
          {event.title || "Untitled Event"}
        </h3>
        {event.small_description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {event.small_description}
          </p>
        )}
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{event.location || "Location TBA"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{formatTime(event.start_time)}</span>
          </div>
        </div>
        <Button variant="default" className="w-full">
          {isLoggedIn ? "View Details" : "Login to View"}
        </Button>
      </div>
    </div>
  )
}
