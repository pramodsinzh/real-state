import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { signUpSchema } from "@/lib/validations/auth"

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not set")
      return NextResponse.json(
        { error: "Server misconfiguration: database is not configured" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const parsed = signUpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role, phoneNumber } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    })

    if (role === "manager") {
      await prisma.manager.create({
        data: { cognitoId: user.id, name, email, phoneNumber },
      })
    } else {
      await prisma.tenant.create({
        data: { cognitoId: user.id, name, email, phoneNumber },
      })
    }

    return NextResponse.json({ id: user.id, email: user.email, role: user.role })
  } catch (error: unknown) {
    console.error("Signup failed:", error)
    const message =
      error instanceof Error ? error.message : "Something went wrong"
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Server error during signup. Check database configuration." : message },
      { status: 500 }
    )
  }
}
