'use server'

import { createSupabaseClient } from "@/config/supabase-config"
import { IEventTicketType } from "@/interfaces"

export const createTicketType = async (payload: Partial<IEventTicketType>) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("events_ticket_types")
      .insert([payload])
      .select()

    if (response.error) {
      throw new Error("Error creating ticket type: " + response.error.message)
    }

    return {
      success: true,
      message: "Ticket type created successfully",
      data: response.data?.[0]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const updateTicketType = async (id: number, payload: Partial<IEventTicketType>) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("events_ticket_types")
      .update(payload)
      .eq("id", id)
      .select()

    if (response.error) {
      throw new Error("Error updating ticket type: " + response.error.message)
    }

    return {
      success: true,
      message: "Ticket type updated successfully",
      data: response.data?.[0]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const deleteTicketType = async (id: number) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("events_ticket_types")
      .delete()
      .eq("id", id)

    if (response.error) {
      throw new Error("Error deleting ticket type: " + response.error.message)
    }

    return {
      success: true,
      message: "Ticket type deleted successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getTicketTypeById = async (id: number) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("events_ticket_types")
      .select("*")
      .eq("id", id)
      .single()

    if (response.error) {
      throw new Error("Error fetching ticket type: " + response.error.message)
    }

    return {
      success: true,
      data: response.data as IEventTicketType
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getTicketTypesByEventId = async (eventId: number) => {
  try {
    const supabase = await createSupabaseClient()
    const response = await supabase
      .from("events_ticket_types")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })

    if (response.error) {
      throw new Error("Error fetching ticket types: " + response.error.message)
    }

    return {
      success: true,
      data: response.data as IEventTicketType[]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}