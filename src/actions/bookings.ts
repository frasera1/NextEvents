'use server'

import { createSupabaseClient } from "@/config/supabase-config"
import { IBooking } from "@/interfaces"
import { getLoggedInUser } from "./users"
import { updateTicketType } from "./events-ticket-types"

export const createBooking = async (payload: Partial<IBooking>) => {
  try {
    const supabase = await createSupabaseClient()
    
    // Get the logged-in user
    const userResponse = await getLoggedInUser()
    if (!userResponse.success || !userResponse.data) {
      throw new Error("User not authenticated")
    }

    const bookingPayload = {
      ...payload,
      user_id: parseInt(userResponse.data.id),
      status: payload.status || "confirmed",
    }

    const response = await supabase
      .from("bookings")
      .insert([bookingPayload])
      .select()

    if (response.error) {
      throw new Error("Error creating booking: " + response.error.message)
    }

    return {
      success: true,
      message: "Booking created successfully",
      data: response.data?.[0] as IBooking
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const createBookingsForTickets = async (
  eventId: number,
  selectedTickets: Record<number, number>,
  paymentId: string,
  totalAmount: number
) => {
  try {
    // Get the logged-in user
    const userResponse = await getLoggedInUser()
    if (!userResponse.success || !userResponse.data) {
      throw new Error("User not authenticated")
    }

    const userId = parseInt(userResponse.data.id)
    const supabase = await createSupabaseClient()

    // Fetch ticket types to get names and prices
    const ticketTypeIds = Object.keys(selectedTickets).map(id => parseInt(id))
    const { data: ticketTypes, error: ticketTypesError } = await supabase
      .from("events_ticket_types")
      .select("*")
      .in("id", ticketTypeIds)

    if (ticketTypesError || !ticketTypes) {
      throw new Error("Error fetching ticket types: " + ticketTypesError?.message)
    }

    // Create bookings for each ticket type
    const bookings = ticketTypes.map(ticketType => {
      const quantity = selectedTickets[ticketType.id]
      return {
        event_id: eventId,
        user_id: userId,
        ticket_type_id: ticketType.id,
        ticket_type_name: ticketType.name || "General Admission",
        booked_tickets: quantity,
        payment_id: paymentId,
        total_amount: (ticketType.price || 0) * quantity,
        status: "confirmed",
      }
    })

    // Insert all bookings
    const { data: createdBookings, error: bookingsError } = await supabase
      .from("bookings")
      .insert(bookings)
      .select()

    if (bookingsError) {
      throw new Error("Error creating bookings: " + bookingsError.message)
    }

    // Update ticket availability for each ticket type
    for (const ticketType of ticketTypes) {
      const quantity = selectedTickets[ticketType.id]
      const currentAvailable = ticketType.available_tickets || 0
      const currentBooked = ticketType.booked_tickets || 0

      await updateTicketType(ticketType.id, {
        available_tickets: Math.max(0, currentAvailable - quantity),
        booked_tickets: currentBooked + quantity,
      })
    }

    return {
      success: true,
      message: "Bookings created successfully",
      data: createdBookings as IBooking[]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getBookingsByUserId = async () => {
  try {
    const userResponse = await getLoggedInUser()
    if (!userResponse.success || !userResponse.data) {
      throw new Error("User not authenticated")
    }

    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", parseInt(userResponse.data.id))
      .order("created_at", { ascending: false })

    if (response.error) {
      throw new Error("Error fetching bookings: " + response.error.message)
    }

    return {
      success: true,
      data: response.data as IBooking[]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getBookingById = async (id: number) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single()

    if (response.error) {
      throw new Error("Error fetching booking: " + response.error.message)
    }

    return {
      success: true,
      data: response.data as IBooking
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getBookingsByEventId = async (eventId: number) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("bookings")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })

    if (response.error) {
      throw new Error("Error fetching bookings: " + response.error.message)
    }

    return {
      success: true,
      data: response.data as IBooking[]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getAllBookings = async () => {
  try {
    const supabase = await createSupabaseClient()
    
    // Get all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (bookingsError) {
      throw new Error("Error fetching bookings: " + bookingsError.message)
    }

    if (!bookings || bookings.length === 0) {
      return {
        success: true,
        data: []
      }
    }

    // Fetch user and event data for each booking
    const bookingsWithRelations = await Promise.all(
      bookings.map(async (booking) => {
        const relations: any = { ...booking }

        // Fetch user data
        if (booking.user_id) {
          const { data: user } = await supabase
            .from("user_profiles")
            .select("id, name, email")
            .eq("id", booking.user_id)
            .single()
          relations.user_profiles = user
        }

        // Fetch event data
        if (booking.event_id) {
          const { data: event } = await supabase
            .from("events")
            .select("id, title, date")
            .eq("id", booking.event_id)
            .single()
          relations.events = event
        }

        return relations
      })
    )

    return {
      success: true,
      data: bookingsWithRelations
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const cancelBooking = async (bookingId: number) => {
  try {
    const userResponse = await getLoggedInUser()
    if (!userResponse.success || !userResponse.data) {
      throw new Error("User not authenticated")
    }

    const supabase = await createSupabaseClient()

    // For admin, allow cancelling any booking; for users, verify ownership
    const isAdmin = userResponse.data.role === 'admin'
    
    let bookingQuery = supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
    
    if (!isAdmin) {
      bookingQuery = bookingQuery.eq("user_id", parseInt(userResponse.data.id))
    }
    
    const { data: booking, error: fetchError } = await bookingQuery.single()

    if (fetchError || !booking) {
      throw new Error("Booking not found or you don't have permission to cancel it")
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled")
    }

    // Update booking status to cancelled
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)

    if (updateError) {
      throw new Error("Error cancelling booking: " + updateError.message)
    }

    // Restore ticket availability if ticket_type_id exists
    if (booking.ticket_type_id && booking.booked_tickets) {
      const { data: ticketType, error: ticketError } = await supabase
        .from("events_ticket_types")
        .select("*")
        .eq("id", booking.ticket_type_id)
        .single()

      if (!ticketError && ticketType) {
        const currentAvailable = ticketType.available_tickets || 0
        const currentBooked = ticketType.booked_tickets || 0

        await updateTicketType(booking.ticket_type_id, {
          available_tickets: currentAvailable + booking.booked_tickets,
          booked_tickets: Math.max(0, currentBooked - booking.booked_tickets),
        })
      }
    }

    return {
      success: true,
      message: "Booking cancelled successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
} 