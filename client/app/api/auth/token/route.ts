import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = jwt.sign(
    { id: session.user.id, role: session.user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  )

  return NextResponse.json({ token })
}