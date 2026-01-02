"use client"

import { useState } from "react"
import { createStripePaymentIntent } from "@/actions/payments"
import toast from "react-hot-toast"
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function useEventTicketsEntry() {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreatePaymentIntent = async (
    totalPrice: number,
    selectedTickets: Record<number, number>
  ) => {
    if (totalPrice <= 0) {
      toast.error("Please select at least one ticket")
      return
    }

    setIsProcessing(true)
    try {
      const result = await createStripePaymentIntent(totalPrice)

      if (result.success && result.paymentIntent) {
        console.log("Stripe Payment Intent Client Secret:", result.paymentIntent)
        console.log("Selected Tickets:", selectedTickets)
        console.log("Total Price:", totalPrice)
        toast.success("Payment intent created successfully")
        return result.paymentIntent
      } else {
        toast.error(result.message || "Failed to create payment intent")
        return null
      }
    } catch (error: any) {
      console.error("Error creating payment intent:", error)
      toast.error(error.message || "Failed to create payment intent")
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    handleCreatePaymentIntent,
    isProcessing,
  }
}

