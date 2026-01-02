'use server'

import { createSupabaseClient } from "@/config/supabase-config"
import { IUser } from "@/interfaces"
import bcrypt from "bcryptjs"

// Get all users
export const getAllUsers = async () => {
  try {
    const supabase = await createSupabaseClient()

    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("id, name, email, role, is_active, created_at, avatar")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error("Error fetching users: " + error.message)
    }

    return {
      success: true,
      data: users as Omit<IUser, 'password'>[]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

// Get user by ID
export const getUserById = async (id: string) => {
  try {
    const supabase = await createSupabaseClient()

    const { data: user, error } = await supabase
      .from("user_profiles")
      .select("id, name, email, role, is_active, created_at, avatar")
      .eq("id", id)
      .single()

    if (error) {
      throw new Error("Error fetching user: " + error.message)
    }

    return {
      success: true,
      data: user as Omit<IUser, 'password'>
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

// Create new user
export const createUser = async (payload: {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
}) => {
  try {
    const supabase = await createSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", payload.email)
      .single()

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists"
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 10)

    // Create new user
    const { data, error } = await supabase
      .from("user_profiles")
      .insert([{
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: payload.role,
        is_active: true
      }])
      .select("id, name, email, role, is_active, created_at, avatar")

    if (error) {
      throw new Error("Error creating user: " + error.message)
    }

    return {
      success: true,
      message: "User created successfully",
      data: data[0]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

// Update user
export const updateUser = async (
  id: string,
  payload: {
    name?: string
    email?: string
    role?: 'admin' | 'user'
    password?: string
  }
) => {
  try {
    const supabase = await createSupabaseClient()

    // If email is being updated, check if it's already used by another user
    if (payload.email) {
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", payload.email)
        .neq("id", id)
        .single()

      if (existingUser) {
        return {
          success: false,
          message: "Email is already used by another user"
        }
      }
    }

    const updateData: any = {}

    if (payload.name) updateData.name = payload.name
    if (payload.email) updateData.email = payload.email
    if (payload.role) updateData.role = payload.role

    // Hash password if provided
    if (payload.password) {
      updateData.password = await bcrypt.hash(payload.password, 10)
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", id)
      .select("id, name, email, role, is_active, created_at, avatar")

    if (error) {
      throw new Error("Error updating user: " + error.message)
    }

    return {
      success: true,
      message: "User updated successfully",
      data: data[0]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

// Delete user (with booking check)
export const deleteUser = async (id: string) => {
  try {
    const supabase = await createSupabaseClient()

    // Check if user has any bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("user_id", parseInt(id))

    if (bookingsError) {
      throw new Error("Error checking user bookings: " + bookingsError.message)
    }

    if (bookings && bookings.length > 0) {
      return {
        success: false,
        message: `Cannot delete user. This user has ${bookings.length} booking(s). Please cancel or reassign bookings first.`
      }
    }

    // Delete user
    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error("Error deleting user: " + error.message)
    }

    return {
      success: true,
      message: "User deleted successfully"
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

// Toggle user active status
export const toggleUserStatus = async (id: string, currentStatus: boolean) => {
  try {
    const supabase = await createSupabaseClient()

    const { data, error } = await supabase
      .from("user_profiles")
      .update({ is_active: !currentStatus })
      .eq("id", id)
      .select("id, name, email, role, is_active, created_at, avatar")

    if (error) {
      throw new Error("Error updating user status: " + error.message)
    }

    return {
      success: true,
      message: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      data: data[0]
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}
