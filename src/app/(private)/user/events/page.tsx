import { getAllEvents } from "@/actions/events"
import { Button } from "@/components/ui/button"
import PageTitle from "@/components/ui/page-title"
import { formatDate } from "@/lib/utils"
import { Calendar, MapPin, Clock, Users, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

async function UserEventsPage() {
  const result = await getAllEvents()
  const events = result.success ? result.data || [] : []
  
  // Filter only published events for users
  const publishedEvents = events.filter(event => event.status === 'published')

  return (
    <div className="space-y-6">
      <PageTitle title="Upcoming Events" />
      
      {publishedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No events available</h3>
          <p className="text-muted-foreground">
            Check back later for upcoming events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow bg-card flex flex-col"
            >
              {/* Event Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                {event.images && event.images.length > 0 && event.images[0] ? (
                  <Image
                    src={event.images[0]}
                    alt={event.title || "Event image"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-primary/40" />
                  </div>
                )}
                {event.status && (
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      event.status === 'published' ? 'bg-green-500/90 text-white' :
                      event.status === 'draft' ? 'bg-yellow-500/90 text-white' :
                      event.status === 'completed' ? 'bg-blue-500/90 text-white' :
                      'bg-red-900/90 text-white'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Event Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-2">
                  {event.title || "Untitled Event"}
                </h3>
                
                {event.small_description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.small_description}
                  </p>
                )}

                <div className="space-y-2 mb-4 text-sm text-muted-foreground flex-1">
                  {event.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  )}
                  
                  {event.start_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>
                        {event.start_time}
                        {event.end_time && ` - ${event.end_time}`}
                      </span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                  
                  {event.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <Button className="w-full" asChild>
                    <Link href={`/user/events/${event.id}`}>
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserEventsPage
