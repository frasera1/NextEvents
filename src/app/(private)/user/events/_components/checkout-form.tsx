"use client"

import { useState, FormEvent } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"
import useUsersStore, { UsersStore } from "@/store/user-store"
import { createBookingsForTickets } from "@/actions/bookings"
import { useRouter } from "next/navigation"

interface CheckoutFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalPrice: number
  totalTickets: number
  eventId: number
  selectedTickets: Record<number, number>
}

function CheckoutForm({ 
  open, 
  onOpenChange, 
  totalPrice, 
  totalTickets,
  eventId,
  selectedTickets 
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useUsersStore() as UsersStore
  const userName = user?.name || "Guest"
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/user/events`,
          payment_method_data: {
            billing_details: {
              name: userName,
              email: user?.email || undefined,
            },
          },
        },
        redirect: "if_required",
      })

      if (error) {
        toast.error(error.message || "Payment failed")
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Create bookings and update ticket availability
        const bookingResult = await createBookingsForTickets(
          eventId,
          selectedTickets,
          paymentIntent.id,
          totalPrice
        )

        if (bookingResult.success) {
          toast.success(`Payment successful, ${userName}! Your booking is confirmed.`)
          onOpenChange(false)
          // Navigate to bookings page
          router.push('/user/bookings')
        } else {
          toast.error(bookingResult.message || "Payment succeeded but failed to create booking")
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during payment")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            Review your order and enter your payment details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left Column - Order Summary */}
            <div className="flex flex-col">
              <div className="rounded-lg border border-border p-3 bg-muted/50 flex-1 flex flex-col">
                <h3 className="font-semibold text-foreground text-sm mb-2">Order Summary</h3>
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tickets:</span>
                    <span className="font-medium">{totalTickets}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                    <span>Total Amount:</span>
                    <span className="text-primary">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stripe Payment Element */}
            <div className="flex flex-col">
              <div className="rounded-lg border border-border p-3 flex-1 flex flex-col">
                <h3 className="font-semibold text-foreground text-sm mb-2">Payment Details</h3>
                <div className="flex-1 min-h-0">
                  <PaymentElement 
                    options={{
                      business: {
                        name: "NextEvents",
                      },
                      fields: {
                        billingDetails: {
                          name: "auto",
                          email: "auto",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!stripe || !elements || isProcessing}>
              {isProcessing ? `Processing payment for ${userName}...` : `Pay ${new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalPrice)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CheckoutForm