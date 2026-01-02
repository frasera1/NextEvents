import { Button } from "@/components/ui/button"
import PageTitle from "@/components/ui/page-title"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { getAllEvents } from "@/actions/events"
import { formatDate } from "@/lib/utils"
import EventActionsCell from "@/app/(private)/admin/events/_components/event-actions-cell"

async function AdminEventsPage() {
  const result = await getAllEvents()
  const events = result.success ? result.data || [] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle title="Manage Events" />
        <Link href="/admin/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/90">
            <TableRow className="hover:bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No events found. Create your first event to get started.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' :
                      event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <EventActionsCell eventId={event.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AdminEventsPage
