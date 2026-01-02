'use server'

import { createSupabaseClient } from "@/config/supabase-config"
import { IUser } from "@/interfaces"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export const registerUser = async (payload: Partial<IUser>) => {
  try {
    const supabase = await createSupabaseClient()
    const existingUserResponse = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", payload.email)
      .single();

    if (existingUserResponse.error && existingUserResponse.error.code !== 'PGRST116') {
      throw new Error(
        "Error checking existing user: " + existingUserResponse.error.message
      );
    }

    if (existingUserResponse.data) {
      return {
        success: false,
        message: "User with this email already exists."
      };
    }

    const hashedPassword = await bcrypt.hash(payload.password || "", 10);

    const newUser = {
      ...payload,
      password: hashedPassword,
      role: 'user',
      is_active: true
    };

    const insertResponse = await supabase
      .from("user_profiles")
      .insert([newUser])
      .select();

    if (insertResponse.error) {
      throw new Error(
        "Error creating user: " + insertResponse.error.message
      );
    }

    return {
      success: true,
      message: "User registered successfully",
      data: insertResponse.data?.[0]
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

export const loginUser = async (email: string, password: string, role: string) => {
  try {
    const supabase = await createSupabaseClient()
    
    const userResponse = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .eq("role", role)
      .single();

    if (userResponse.error) {
      return {
        success: false,
        message: "Invalid email or password."
      };
    }

    const user = userResponse.data as IUser;

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password."
      };
    }

    if (!user.is_active) {
      return {
        success: false,
        message: "Your account has been deactivated."
      };
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );

    return {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

export const getLoggedInUser = async () => {
  try {
    const cookiestore = await cookies()
    const token = cookiestore.get("authToken")?.value
    if (!token) {
      throw new Error("No auth token found")
    }
    const secret = process.env.JWT_SECRET
    const decoded = jwt.verify(token, secret!)
    const supabase = await createSupabaseClient()
    const userId = (decoded as any).userId

    const userResponse = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (userResponse.error) {
      throw new Error(
        "Error fetching user: " + userResponse.error.message
      );
    }

    const user = userResponse.data as IUser

    return {
      success: true,
      data : {
        ...user,
        password:''
      }
    };

  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    }
  }
}