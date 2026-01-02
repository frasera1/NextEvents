import { getDashboardStats } from "@/actions/dashboard"
import PageTitle from "@/components/ui/page-title"
import DashboardCard from "@/components/dashboard-card"
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  CalendarCheck,
  CalendarX,
  TrendingUp,
  CheckCircle,
} from "lucide-react"

async function AdminDashboardPage() {
  // Fetch dashboard statistics
  const statsResponse = await getDashboardStats()
  const stats = statsResponse.success ? statsResponse.data : null

  // Default values if fetch fails
  const dashboardData = {
    totalUsers: stats?.totalUsers || 0,
    totalEvents: stats?.totalEvents || 0,
    totalBookings: stats?.totalBookings || 0,
    totalRevenue: stats?.totalRevenue || 0,
    upcomingBookings: stats?.upcomingBookings || 0,
    completedBookings: stats?.completedBookings || 0,
    upcomingEvents: stats?.upcomingEvents || 0,
    completedEvents: stats?.completedEvents || 0,
  }

  // Define cards configuration following DRY principle
  const cardConfigs = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: Users,
      description: "Registered users in the system",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Total Events",
      value: dashboardData.totalEvents,
      icon: Calendar,
      description: "All events in the system",
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings,
      icon: Ticket,
      description: "All bookings made",
      iconColor: "text-orange-600",
      iconBgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Total Revenue",
      value: dashboardData.totalRevenue,
      icon: DollarSign,
      description: "Total revenue generated",
      valuePrefix: "$",
      iconColor: "text-green-600",
      iconBgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Upcoming Bookings",
      value: dashboardData.upcomingBookings,
      icon: CalendarCheck,
      description: "Confirmed bookings",
      iconColor: "text-cyan-600",
      iconBgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    },
    {
      title: "Completed Bookings",
      value: dashboardData.completedBookings,
      icon: CheckCircle,
      description: "Successfully completed",
      iconColor: "text-emerald-600",
      iconBgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Upcoming Events",
      value: dashboardData.upcomingEvents,
      icon: TrendingUp,
      description: "Events scheduled ahead",
      iconColor: "text-indigo-600",
      iconBgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    },
    {
      title: "Completed Events",
      value: dashboardData.completedEvents,
      icon: CalendarX,
      description: "Past events",
      iconColor: "text-slate-600",
      iconBgColor: "bg-slate-100 dark:bg-slate-900/20",
    },
  ]

  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" />

      {/* Display error message if fetch failed */}
      {!statsResponse.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">
            Failed to load dashboard statistics: {statsResponse.message}
          </p>
        </div>
      )}

      {/* Dashboard Cards Grid - 4 cards per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardConfigs.map((config, index) => (
          <DashboardCard
            key={index}
            title={config.title}
            value={config.value}
            icon={config.icon}
            description={config.description}
            valuePrefix={config.valuePrefix}
            iconColor={config.iconColor}
            iconBgColor={config.iconBgColor}
          />
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage
