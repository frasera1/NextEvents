'use server'

import { createSupabaseClient } from "@/config/supabase-config"
import { IEvent } from "@/interfaces"

export const createEvent = async (payload: Partial<IEvent>) => {
  try {
    const supabase = await createSupabaseClient()

    const { image_url, ...eventData } = payload as any

    const response = await supabase
      .from("events")
      .insert([eventData])
      .select()

    if (response.error) {
      throw new Error("Error creating event: " + response.error.message)
    }

    return {
      success: true,
      message: "Event created successfully",
      data: response.data?.[0]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const updateEventById = async (id: number, payload: Partial<IEvent>) => {
  try {
    const supabase = await createSupabaseClient()

    const { image_url, ...eventData } = payload as any

    const response = await supabase
      .from("events")
      .update(eventData)
      .eq("id", id)
      .select()

    if (response.error) {
      throw new Error("Error updating event: " + response.error.message)
    }

    return {
      success: true,
      message: "Event updated successfully",
      data: response.data?.[0]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const deleteEventById = async (id: number) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("events")
      .delete()
      .eq("id", id)

    if (response.error) {
      throw new Error("Error deleting event: " + response.error.message)
    }

    return {
      success: true,
      message: "Event deleted successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getEventById = async (id: number) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()

    if (response.error) {
      throw new Error("Error fetching event: " + response.error.message)
    }

    return {
      success: true,
      data: response.data as IEvent
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getAllEvents = async () => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (response.error) {
      throw new Error("Error fetching events: " + response.error.message)
    }

    return {
      success: true,
      data: response.data as IEvent[]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getUpcomingEvents = async (limit?: number) => {
  try {
    const supabase = await createSupabaseClient()
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format

    let query = supabase
      .from("events")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true })

    if (limit) {
      query = query.limit(limit)
    }

    const response = await query

    if (response.error) {
      throw new Error("Error fetching upcoming events: " + response.error.message)
    }

    return {
      success: true,
      data: response.data as IEvent[]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}
