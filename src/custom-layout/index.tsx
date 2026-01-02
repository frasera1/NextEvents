'use client'

import { usePathname } from "next/navigation"
import PrivateLayout from "./private-layout"

function CustomLayout({children}: {children: React.ReactNode}) {
  const pathname = usePathname()
  const isPrivate = pathname.startsWith('/user') || pathname.startsWith('/admin')
  if (isPrivate) {
    return <PrivateLayout>{children}</PrivateLayout>
  }
  // For public routes, render children directly
  return <>{children}</>
}
export default CustomLayout