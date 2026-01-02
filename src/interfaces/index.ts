export interface IUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  password: string
  avatar?: string
  is_active: boolean
  created_at: string
}

export interface IEvent {
  id: number
  created_at: string
  title?: string
  small_description?: string
  full_description?: string
  date?: string
  start_time?: string
  end_time?: string
  location?: string
  capacity?: number
  status?: string
  guests?: string[]
  images?: string[] | null
}

export interface IEventTicketType {
  id: number
  created_at: string
  event_id: number
  name?: string
  price?: number
  total_tickets?: number
  available_tickets?: number
  booked_tickets?: number
}

export interface IBooking {
  id: number
  created_at: string
  event_id?: number
  user_id?: number
  ticket_type_id?: number
  ticket_type_name?: string
  booked_tickets?: number
  payment_id?: string
  total_amount?: number
  status?: string
}

export interface IDashboardStats {
  totalUsers: number
  totalEvents: number
  totalBookings: number
  totalRevenue: number
  upcomingBookings: number
  completedBookings: number
  upcomingEvents: number
  completedEvents: number
}

