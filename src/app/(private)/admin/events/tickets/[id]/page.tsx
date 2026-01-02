import PageTitle from "@/components/ui/page-title"
import { getEventById } from "@/actions/events"
import { getTicketTypesByEventId } from "@/actions/events-ticket-types"
import TicketTypesManager from "../../_components/ticket-types-manager"

interface EventTicketTypesProps {
  params: Promise<{ id: string }>
}

async function EventTicketTypes({ params }: EventTicketTypesProps) {
  const { id } = await params
  const eventId = parseInt(id)
  const eventResponse = await getEventById(eventId)
  const ticketTypesResponse = await getTicketTypesByEventId(eventId)

  const event = eventResponse.data
  const ticketTypes = ticketTypesResponse.data || []

  return (
    <div className="space-y-6">
      <PageTitle title={`Manage ticket types for: ${event?.title}`} />
      <TicketTypesManager eventId={eventId} ticketTypes={ticketTypes} />
    </div>
  )
}
export default EventTicketTypes