import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isLoggedIn = !!session?.user
  const role = session?.user?.role

  const isAuthRoute = pathname === "/signin" || pathname === "/signup"
  const isPublicRoute = pathname === "/" || pathname === "/landing"

  if (isPublicRoute && !isLoggedIn) {
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    if (isAuthRoute) return NextResponse.next()
    return NextResponse.redirect(new URL("/signin", req.url))
  }

  if (!role && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }

  if (role && (pathname === "/onboarding" || isAuthRoute)) {
    return NextResponse.redirect(new URL("/landing", req.url))
  }

  if (pathname.startsWith("/managers") && role !== "manager") {
    return NextResponse.redirect(new URL("/tenants/dashboard", req.url))
  }
  if (pathname.startsWith("/tenants") && role !== "manager" && role !== "tenant") {
    return NextResponse.redirect(new URL("/managers/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/",
    "/landing",
    "/managers/:path*",
    "/tenants/:path*",
    "/onboarding",
    "/signin",
    "/signup",
  ],
}