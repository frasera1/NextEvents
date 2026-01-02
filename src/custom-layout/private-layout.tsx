'use client'

import { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/actions/users'
import useUsersStore from '@/store/user-store'
import Spinner from '@/components/spinner'
import Header from "./header"

function PrivateLayout({children}: {children: React.ReactNode}) {
  const setUser = useUsersStore((state) => state.setUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await getLoggedInUser()
        if (result.success && result.data) {
          setUser(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [setUser])

  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Spinner />
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="py-5 px-10">{children}</main>
    </div>
  )
}
export default PrivateLayout