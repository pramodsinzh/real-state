"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname.match(/^\/(login|register)$/)

  // Redirect authenticated users away from auth pages
  if (!isLoading && isAuthenticated && isAuthPage) {
    router.push("/")
    return null
  }

  return <>{children}</>
}

export default AuthWrapper