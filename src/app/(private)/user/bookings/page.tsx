"use client"

import { useState, useEffect } from "react"
import { getBookingsByUserId, cancelBooking } from "@/actions/bookings"
import { getEventById } from "@/actions/events"
import PageTitle from "@/components/ui/page-title"
import { formatDate } from "@/lib/utils"
import { Calendar, Ticket, DollarSign, CheckCircle, Clock, XCircle, MapPin, Users, Image as ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IBooking, IEvent } from "@/interfaces"
import Image from "next/image"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface BookingWithEvent extends IBooking {
  event: IEvent | null
}

function UserBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithEvent | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const bookingsResponse = await getBookingsByUserId()
        const bookingsData = bookingsResponse.success ? bookingsResponse.data || [] : []

        // Fetch event details for each booking
        const bookingsWithEvents: BookingWithEvent[] = await Promise.all(
          bookingsData.map(async (booking) => {
            if (booking.event_id) {
              const eventResponse = await getEventById(booking.event_id)
              return {
                ...booking,
                event: eventResponse.success ? (eventResponse.data || null) : null,
              } as BookingWithEvent
            }
            return { ...booking, event: null } as BookingWithEvent
          })
        )

        setBookings(bookingsWithEvents)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast.error("Failed to load bookings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleViewDetails = (booking: BookingWithEvent) => {
    setSelectedBooking(booking)
    setIsDetailsOpen(true)
  }

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
        const bookingsResponse = await getBookingsByUserId()
        const bookingsData = bookingsResponse.success ? bookingsResponse.data || [] : []
        const bookingsWithEvents: BookingWithEvent[] = await Promise.all(
          bookingsData.map(async (booking) => {
            if (booking.event_id) {
              const eventResponse = await getEventById(booking.event_id)
              return {
                ...booking,
                event: eventResponse.success ? (eventResponse.data || null) : null,
              } as BookingWithEvent
            }
            return { ...booking, event: null } as BookingWithEvent
          })
        )
        setBookings(bookingsWithEvents)
      } else {
        toast.error(result.message || "Failed to cancel booking")
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while cancelling booking")
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle title="My Bookings" />
        <div className="flex items-center justify-center py-16">
          <div className="text-muted-foreground">Loading bookings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageTitle title="My Bookings" />

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground mb-4">
            You haven't made any bookings yet.
          </p>
          <Button asChild>
            <a href="/user/events">Browse Events</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border border-border p-6 bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left Section - Booking Details */}
                <div className="flex-1 space-y-4">
                  {/* Event Title */}
                  {booking.event ? (
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {booking.event.title || "Untitled Event"}
                      </h3>
                      {booking.event.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.event.date)}</span>
                          {booking.event.location && (
                            <>
                              <span>•</span>
                              <span>{booking.event.location}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <h3 className="text-xl font-bold text-foreground">
                      Event ID: {booking.event_id}
                    </h3>
                  )}

                  {/* Ticket Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Ticket Type</p>
                        <p className="text-muted-foreground">
                          {booking.ticket_type_name || "General Admission"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Quantity</p>
                        <p className="text-muted-foreground">
                          {booking.booked_tickets || 0} ticket(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Amount</p>
                        <p className="text-muted-foreground">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(booking.total_amount || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Booking Date</p>
                        <p className="text-muted-foreground">
                          {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Status and Actions */}
                <div className="flex flex-col items-start md:items-end gap-3">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {booking.status === "confirmed" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : booking.status === "pending" ? (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-900" />
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : booking.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                          : "bg-red-900/10 text-red-900 border border-red-900/20"
                      }`}
                    >
                      {booking.status || "Unknown"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {booking.event_id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(booking)}
                      >
                        View Details
                      </Button>
                    )}
                    
                    {booking.status !== "cancelled" && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleCancelClick(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>

                  {/* Payment ID */}
                  {booking.payment_id && (
                    <p className="text-xs text-muted-foreground">
                      Payment ID: {booking.payment_id.slice(0, 20)}...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about your booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Event Image */}
              {selectedBooking.event?.images && selectedBooking.event.images.length > 0 && (
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                  <Image
                    src={selectedBooking.event.images[0]}
                    alt={selectedBooking.event.title || "Event image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              )}

              {/* Event Information */}
              {selectedBooking.event && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {selectedBooking.event.title || "Untitled Event"}
                    </h3>
                    {selectedBooking.event.small_description && (
                      <p className="text-muted-foreground">
                        {selectedBooking.event.small_description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBooking.event.date && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Date</p>
                          <p className="text-muted-foreground">
                            {formatDate(selectedBooking.event.date)}
                          </p>
                        </div>
                      </div>
                    )}

                    {(selectedBooking.event.start_time || selectedBooking.event.end_time) && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Time</p>
                          <p className="text-muted-foreground">
                            {selectedBooking.event.start_time}
                            {selectedBooking.event.end_time && ` - ${selectedBooking.event.end_time}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedBooking.event.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Location</p>
                          <p className="text-muted-foreground">{selectedBooking.event.location}</p>
                        </div>
                      </div>
                    )}

                    {selectedBooking.event.capacity && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Capacity</p>
                          <p className="text-muted-foreground">
                            {selectedBooking.event.capacity} attendees
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Information */}
              <div className="rounded-lg border border-border p-4 bg-muted/50 space-y-3">
                <h4 className="font-semibold text-foreground">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ticket Type</p>
                    <p className="font-medium">{selectedBooking.ticket_type_name || "General Admission"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{selectedBooking.booked_tickets || 0} ticket(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(selectedBooking.total_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedBooking.status || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Booking Date</p>
                    <p className="font-medium">{formatDate(selectedBooking.created_at)}</p>
                  </div>
                  {selectedBooking.payment_id && (
                    <div>
                      <p className="text-muted-foreground">Payment ID</p>
                      <p className="font-medium text-xs break-all">{selectedBooking.payment_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Confirmation Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone. 
              Your tickets will be released and made available for others.
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

export default UserBookingsPage
