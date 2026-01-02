import PageTitle from "@/components/ui/page-title"
import EventForm from "../../_components/event-form"
import { getEventById } from "@/actions/events"
import { notFound } from "next/navigation"

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const eventId = parseInt(id)

  // Fetch the event data
  const result = await getEventById(eventId)

  if (!result.success || !result.data) {
    notFound()
  }

  const event = result.data
  
  return (
    <div className="space-y-6">
      <PageTitle title="Edit Event" />
      
      {/* Event Details Section */}
      <div className="rounded-lg border border-border p-6 bg-card">
        <h2 className="text-xl font-bold text-foreground mb-4">Event Details</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Event Title</p>
            <p className="text-foreground">{event.title || "Untitled Event"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Guests</p>
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

      <div className="mt-8">
        <EventForm 
          formType="edit" 
          initialData={{
            title: event.title,
            small_description: event.small_description,
            full_description: event.full_description,
            date: event.date,
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location,
            capacity: event.capacity?.toString(),
            status: event.status,
          }}
          eventId={eventId}
          existingImages={event.images || []}
        />
      </div>
    </div>
  )
}
export default EditEventPage