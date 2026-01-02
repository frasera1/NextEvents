import Link from "next/link"
import useUsersStore, { UsersStore } from "@/store/user-store"
import SidebarMenu from "@/components/sidebar-menu"

function Header() {
  const {user} = useUsersStore() as UsersStore
  
  const getHomePath = () => {
    if (user?.role === 'admin') {
      return '/admin/dashboard'
    }
    return '/user/events'
  }

  return (
    <div className="bg-primary px-10 py-6 flex items-center justify-between">
      <Link 
        href={getHomePath()} 
        className="text-xl font-bold text-white hover:opacity-90 transition-opacity cursor-pointer"
      >
        NextEvents
      </Link>
      <div className="flex gap-5 items-center">
        <div className="text-right">
          <h1 className="text-white text-sm font-medium">{user?.name}</h1>
          <p className="text-xs text-white/80 capitalize">{user?.role}</p>
        </div>
        <SidebarMenu />
      </div>
    </div>
  )
}
export default Header