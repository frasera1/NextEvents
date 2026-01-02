'use server'

import { createSupabaseClient } from "@/config/supabase-config"

export const getDashboardStats = async () => {
  try {
    const supabase = await createSupabaseClient()

    // Parallel execution of all queries for maximum efficiency
    const [usersCount, eventsCount, bookingsData] = await Promise.all([
      // Query 1: Get total users count
      supabase
        .from("user_profiles")
        .select("*", { count: 'exact', head: true }),

      // Query 2: Get all events with date and status
      supabase
        .from("events")
        .select("date, status"),

      // Query 3: Get all bookings data (we'll aggregate this in-memory)
      supabase
        .from("bookings")
        .select("status, total_amount")
    ])

    // Handle potential errors
    if (usersCount.error) {
      throw new Error("Error fetching users count: " + usersCount.error.message)
    }
    if (eventsCount.error) {
      throw new Error("Error fetching events: " + eventsCount.error.message)
    }
    if (bookingsData.error) {
      throw new Error("Error fetching bookings: " + bookingsData.error.message)
    }

    // Calculate bookings statistics from the single bookings query
    const bookings = bookingsData.data || []
    const totalBookings = bookings.length
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0)

    // Count bookings by status
    const confirmedBookings = bookings.filter(b => b.status === "confirmed").length
    const completedBookings = bookings.filter(b => b.status === "completed").length

    // upcomingBookings = confirmed bookings (not yet completed or cancelled)
    const upcomingBookings = confirmedBookings

    // Calculate events statistics
    const events = eventsCount.data || []
    const totalEvents = events.length
    const currentDate = new Date().toISOString().split('T')[0] // Get current date in YYYY-MM-DD format

    const upcomingEvents = events.filter(e => {
      if (!e.date) return false
      return e.date >= currentDate
    }).length

    const completedEvents = events.filter(e => {
      if (!e.date) return false
      return e.date < currentDate
    }).length

    // Required data
    const data = {
      totalUsers: usersCount.count || 0,
      totalEvents,
      totalBookings,
      totalRevenue,
      upcomingBookings,
      completedBookings,
      upcomingEvents,
      completedEvents,
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}
