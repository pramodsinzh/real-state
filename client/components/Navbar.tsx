"use client"

import { NAVBAR_HEIGHT } from "@/lib/constants"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { useGetAuthUserQuery } from "@/state/api"
import { useRouter, usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Bell, MessageCircle, Plus, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { SidebarTrigger } from "./ui/sidebar"

const Navbar = () => {
  const { data: authUser } = useGetAuthUserQuery()
  const router = useRouter()
  const pathname = usePathname()

  const isDashboardPage =
    pathname.includes("/manager") || pathname.includes("/tenants")

  const isManager = authUser?.userRole === "manager"
  const dashboardPath = isManager ? "/managers/properties" : "/tenants/favorites"
  const settingsPath = isManager ? "/managers/settings" : "/tenants/settings"

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full h-full py-3 px-4 sm:px-8 bg-primary-700 text-white">
        <div className="flex items-center gap-4 md:gap-5">
          {isDashboardPage && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )}
          <Link href="/" className="group cursor-pointer" scroll={false}>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Rentiful logo"
                width={24}
                height={24}
                className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="text-xl font-bold">
                <span className="text-white transition-colors duration-300 group-hover:text-secondary-500">
                  RENT
                </span>
                <span className="text-secondary-500 font-light transition-colors duration-300 group-hover:text-white">
                  IFUL
                </span>
              </div>
            </div>
          </Link>

          {isDashboardPage && authUser && (
            <Button
              variant="secondary"
              className="md:ml-4 bg-primary-50 text-primary-700 hover:bg-secondary-500 hover:text-primary-50"
              onClick={() =>
                router.push(isManager ? "/managers/newproperty" : "/search")
              }
            >
              {isManager ? (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:block ml-2">Add New Property</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden md:block ml-2">Search Properties</span>
                </>
              )}
            </Button>
          )}
        </div>

        {!isDashboardPage && (
          <p className="text-primary-200 hidden lg:block">
            Discover your perfect rental apartment with our advanced search
          </p>
        )}

        <div className="flex items-center gap-3 sm:gap-5">
          {authUser ? (
            <>
              <div className="relative hidden md:block">
                <MessageCircle className="w-6 h-6 cursor-pointer text-primary-200 hover:text-primary-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-secondary-700 rounded-full"></span>
              </div>
              <div className="relative hidden md:block">
                <Bell className="w-6 h-6 cursor-pointer text-primary-200 hover:text-primary-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-secondary-700 rounded-full"></span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                  <Avatar>
                    <AvatarImage src={authUser.cognitoInfo?.image ?? undefined} />
                    <AvatarFallback className="bg-primary-600">
                      {authUser.userRole?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-primary-200 hidden md:block">
                    {authUser.userInfo?.name}
                  </p>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-primary-700">
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                    onClick={() => router.push(dashboardPath, { scroll: false })}
                  >
                    Go to Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-200" />
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100 "
                    onClick={() => router.push(settingsPath, { scroll: false })}
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-200" />
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100 "
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-primary-700 hover:border-white rounded-lg transition-all duration-300 px-3 sm:px-4"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="secondary"
                  className="bg-secondary-600 text-white border-secondary-600 hover:bg-transparent hover:text-secondary-600 hover:border-secondary-600 rounded-lg transition-all duration-300 px-3 sm:px-4"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar