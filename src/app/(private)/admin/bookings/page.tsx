"use client"

import { useState, useEffect } from "react"
import { getAllBookings, cancelBooking } from "@/actions/bookings"
import PageTitle from "@/components/ui/page-title"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate, formatDateTime } from "@/lib/utils"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface BookingWithRelations {
  id: number
  created_at: string
  event_id?: number
  user_id?: number
  ticket_type_id?: number
  ticket_type_name?: string
  booked_tickets?: number
  payment_id?: string
  total_amount?: number
  status?: string
  user_profiles?: {
    id: number
    name: string
    email: string
  } | null
  events?: {
    id: number
    title?: string
    date?: string
  } | null
}

function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const result = await getAllBookings()
        if (result.success && result.data) {
          setBookings(result.data)
        } else {
          toast.error(result.message || "Failed to load bookings")
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast.error("Failed to load bookings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleCancelClick = (bookingId: number) => {
    setBookingToCancel(bookingId)
    setIsCancelOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return

    setIsCancelling(true)
    try {
      const result = await cancelBooking(bookingToCancel)
      if (result.success) {
        toast.success(result.message || "Booking cancelled successfully")
        setIsCancelOpen(false)
        setBookingToCancel(null)
        // Refresh bookings
        router.refresh()
        // Reload bookings
        const bookingsResult = await getAllBookings()
        if (bookingsResult.success && bookingsResult.data) {
          setBookings(bookingsResult.data)
        }
      } else {
        toast.error(result.message || "Failed to cancel booking")
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while cancelling booking")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle title="All Bookings" />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-muted-foreground">Loading bookings...</div>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/90">
              <TableRow className="hover:bg-muted/50">
                <TableHead>Customer Name</TableHead>
                <TableHead>Ticket Type</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Booked Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.user_profiles?.name || "Unknown User"}
                    </TableCell>
                    <TableCell>
                      {booking.ticket_type_name || "General Admission"}
                    </TableCell>
                    <TableCell>
                      {booking.events?.date ? formatDate(booking.events.date) : "-"}
                    </TableCell>
                    <TableCell>{booking.booked_tickets || 0}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(booking.total_amount || 0)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "cancelled"
                            ? "bg-red-900/10 text-red-900 border border-red-900/20"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {booking.payment_id || "-"}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(booking.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status !== "cancelled" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cancel Booking Confirmation Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone. 
              The tickets will be released and made available for others.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelOpen(false)
                setBookingToCancel(null)
              }}
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminBookingsPage
