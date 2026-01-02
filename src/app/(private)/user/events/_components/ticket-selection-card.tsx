"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IEventTicketType } from "@/interfaces"
import { Minus, Plus } from "lucide-react"
import { useEventTicketsEntry, stripePromise } from "@/app/(private)/user/events/_components/event-tickets-entry"
import { Elements } from "@stripe/react-stripe-js"
import CheckoutForm from "./checkout-form"

interface TicketSelectionCardProps {
  eventId: number
  ticketTypes: IEventTicketType[]
}

export default function TicketSelectionCard({
  eventId,
  ticketTypes,
}: TicketSelectionCardProps) {
  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({})
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const { handleCreatePaymentIntent, isProcessing } = useEventTicketsEntry()

  const availableTicketTypes = ticketTypes.filter(
    (ticket) => (ticket.available_tickets || 0) > 0
  )

  const handleQuantityChange = (ticketId: number, change: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0
      const ticket = ticketTypes.find((t) => t.id === ticketId)
      const available = ticket?.available_tickets || 0
      const newQuantity = Math.max(0, Math.min(available, current + change))
      
      if (newQuantity === 0) {
        const { [ticketId]: _, ...rest } = prev
        return rest
      }
      
      return { ...prev, [ticketId]: newQuantity }
    })
  }

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
    const ticket = ticketTypes.find((t) => t.id === parseInt(ticketId))
    return sum + (ticket?.price || 0) * qty
  }, 0)

  const handleSelectTickets = async () => {
    if (totalTickets === 0) {
      return
    }
    
    const secret = await handleCreatePaymentIntent(totalPrice, selectedTickets)
    if (secret) {
      setClientSecret(secret)
      setIsCheckoutOpen(true)
    }
  }

  const handleCheckoutClose = (open: boolean) => {
    setIsCheckoutOpen(open)
    if (!open) {
      // Reset client secret when modal closes
      setClientSecret(null)
    }
  }

  if (availableTicketTypes.length === 0) {
    return (
      <div className="rounded-lg border border-border p-6 bg-card">
        <h3 className="text-xl font-bold text-foreground mb-2">Ticket Selection</h3>
        <p className="text-muted-foreground">
          No tickets available for this event.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border p-6 bg-card space-y-6 sticky top-6">
      <h3 className="text-xl font-bold text-foreground">Ticket Selection</h3>

      {/* Ticket Types */}
      <div className="space-y-4">
        {availableTicketTypes.map((ticket) => {
          const quantity = selectedTickets[ticket.id] || 0
          const available = ticket.available_tickets || 0

          return (
            <div
              key={ticket.id}
              className="border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {ticket.name || "General Admission"}
                  </h4>
                  <p className="text-lg font-bold text-primary mt-1">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(ticket.price ?? 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {available} available
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(ticket.id, -1)}
                    disabled={quantity === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(ticket.id, 1)}
                    disabled={quantity >= available}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ready to Book Card */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Book?</h3>
          <p className="text-sm text-muted-foreground">
            Select a ticket type below to proceed with your booking.
          </p>
        </div>

        {totalTickets > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tickets:</span>
              <span className="font-medium text-foreground">{totalTickets}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Total Price:</span>
              <span className="text-primary">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalPrice)}
              </span>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleSelectTickets}
          disabled={totalTickets === 0 || isProcessing}
        >
          {isProcessing ? "Processing..." : "Select Tickets"}
        </Button>
      </div>

      {/* Checkout Modal */}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            open={isCheckoutOpen}
            onOpenChange={handleCheckoutClose}
            totalPrice={totalPrice}
            totalTickets={totalTickets}
            eventId={eventId}
            selectedTickets={selectedTickets}
          />
        </Elements>
      )}
    </div>
  )
}

