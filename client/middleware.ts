import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isLoggedIn = !!session?.user
  const role = session?.user?.role

  const isAuthRoute = pathname === "/login" || pathname === "/register"

  if (!isLoggedIn) {
    if (isAuthRoute) return NextResponse.next()
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (!role && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }

  if (role && (pathname === "/onboarding" || isAuthRoute)) {
    return NextResponse.redirect(
      new URL(role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard", req.url)
    )
  }

  if (pathname.startsWith("/landlord") && role !== "landlord") {
    return NextResponse.redirect(new URL("/tenant/dashboard", req.url))
  }
  if (pathname.startsWith("/tenant") && role !== "tenant") {
    return NextResponse.redirect(new URL("/landlord/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/landlord/:path*",
    "/tenant/:path*",
    "/onboarding",
    "/login",
    "/register",
  ],
}