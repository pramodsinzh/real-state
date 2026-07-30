import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function requireRole(allowedRoles: string[]) {
  const session = await auth()

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (!session.user.role || !allowedRoles.includes(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session }
}