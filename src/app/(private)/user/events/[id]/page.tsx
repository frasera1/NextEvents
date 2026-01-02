import { getEventById } from "@/actions/events"
import { getTicketTypesByEventId } from "@/actions/events-ticket-types"
import { Button } from "@/components/ui/button"
import PageTitle from "@/components/ui/page-title"
import { formatDate } from "@/lib/utils"
import { Calendar, MapPin, Clock, Users, ArrowLeft, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import TicketSelectionCard from "../_components/ticket-selection-card"

interface EventDetailsProps {
  params: Promise<{ id: string }>
}

async function EventDetailsPage({ params }: EventDetailsProps) {
  const { id } = await params
  const eventId = parseInt(id)

  if (isNaN(eventId)) {
    notFound()
  }

  const eventResponse = await getEventById(eventId)
  const ticketTypesResponse = await getTicketTypesByEventId(eventId)

  if (!eventResponse.success || !eventResponse.data) {
    notFound()
  }

  const event = eventResponse.data
  const ticketTypes = ticketTypesResponse.success ? ticketTypesResponse.data || [] : []

  // Only show published events to users
  if (event.status !== 'published') {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Link href="/user/events">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Button>
      </Link>

      {/* Event Title */}
      <PageTitle title={event.title || "Event Details"} />

      {/* About This Event - Full Description */}
      <div className="rounded-lg border border-border p-6 bg-card space-y-4">
        <h2 className="text-2xl font-bold text-foreground">About This Event</h2>
        
        {event.full_description ? (
          <p className="text-muted-foreground whitespace-pre-line">
            {event.full_description}
          </p>
        ) : event.small_description ? (
          <p className="text-muted-foreground">
            {event.small_description}
          </p>
        ) : (
          <p className="text-muted-foreground italic">
            No description available for this event.
          </p>
        )}
      </div>

      {/* Images and Event Details - Flex Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Images (stacked if multiple) */}
        <div className="flex-1 space-y-4">
          {event.images && event.images.length > 0 ? (
            event.images.map((image, index) => (
              <div
                key={index}
                className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5"
              >
                <Image
                  src={image}
                  alt={`${event.title || "Event"} image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))
          ) : (
            <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <ImageIcon className="w-24 h-24 text-primary/40" />
            </div>
          )}
        </div>

        {/* Right Column - Event Details */}
        <div className="flex-1">
          <div className="rounded-lg border border-border p-6 bg-card">
            <h2 className="text-2xl font-bold text-foreground mb-4">Event Details</h2>
            <div className="space-y-4">
              {event.date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Date</p>
                    <p className="text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                </div>
              )}

              {(event.start_time || event.end_time) && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Time</p>
                    <p className="text-muted-foreground">
                      {event.start_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              )}

              {event.capacity && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Capacity</p>
                    <p className="text-muted-foreground">{event.capacity} attendees</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-2">Guests</p>
                  {event.guests && event.guests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {event.guests.map((guest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                        >
                          {guest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No guests</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Selection Card - At the bottom */}
      <div>
        <TicketSelectionCard 
          eventId={eventId}
          ticketTypes={ticketTypes}
        />
      </div>
    </div>
  )
}

export default EventDetailsPage

