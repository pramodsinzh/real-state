'use client'

import Navbar from '@/components/Navbar'
import Loading from '@/components/Loading'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { useGetAuthUserQuery } from '@/state/api'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (authUser) {
      const userRole = authUser.userRole
      if (
        (userRole === 'manager' && pathname.startsWith('/search')) ||
        (userRole === 'manager' && pathname === '/')
      ) {
        router.push("/managers/properties", { scroll: false })
        return
      }
    }

    setIsLoading(false)
  }, [authUser, authLoading, pathname, router])

  if (authLoading || isLoading) return <Loading fullScreen />

  return (
    <div className='h-full w-full'>
      <Navbar />
      <main className={`h-full w-full flex flex-col`} style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        {children}
      </main>
    </div>
  )
}

export default Layout
