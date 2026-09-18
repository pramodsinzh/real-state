import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error("JWT_SECRET is not set")
      return NextResponse.json(
        { error: "Server misconfiguration: JWT_SECRET is missing" },
        { status: 500 }
      )
    }

    const token = jwt.sign(
      { id: session.user.id, role: session.user.role },
      secret,
      { expiresIn: "15m" }
    )

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Token mint failed:", error)
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 })
  }
}
