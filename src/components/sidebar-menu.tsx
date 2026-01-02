'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Calendar, Home, Users, LogOut, User, HelpCircle, Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'
import useUsersStore, { UsersStore } from '@/store/user-store'
import Cookies from 'js-cookie'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface MenuItem {
  name: string
  icon: React.ReactNode
  path: string
}

function SidebarMenu() {
  const { user } = useUsersStore() as UsersStore
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const userMenuItems: MenuItem[] = [
    {
      name: 'Events',
      icon: <Calendar size={20} />,
      path: '/user/events',
    },
    {
      name: 'Bookings',
      icon: <Bookmark size={20} />,
      path: '/user/bookings',
    },
    {
      name: 'Profile',
      icon: <User size={20} />,
      path: '/user/profile',
    },
    {
      name: 'Help',
      icon: <HelpCircle size={20} />,
      path: '/user/help',
    },
  ]

  const adminMenuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: <Home size={20} />,
      path: '/admin/dashboard',
    },
    {
      name: 'Events',
      icon: <Calendar size={20} />,
      path: '/admin/events',
    },
    {
      name: 'Users',
      icon: <Users size={20} />,
      path: '/admin/users',
    },
    {
      name: 'Bookings',
      icon: <Bookmark size={20} />,
      path: '/admin/bookings',
    },
    {
      name: 'Profile',
      icon: <User size={20} />,
      path: '/admin/profile',
    },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems

  const handleNavigate = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const handleLogout = () => {
    // Remove cookies by setting them with expired date
    Cookies.set('authToken', '', { expires: -1 })
    Cookies.set('userRole', '', { expires: -1 })
    useUsersStore.getState().setUser(null)
    toast.success('Logged out successfully')
    setIsOpen(false)
    router.push('/login')
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="p-0 hover:opacity-80 transition-opacity cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-80 flex flex-col">
        <SheetHeader>
          <div className="flex flex-col items-start gap-3">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <SheetTitle className="text-lg">{user?.name}</SheetTitle>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-900 hover:bg-red-900/10 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </SheetContent>
    </Sheet>
  )
}

export default SidebarMenu
