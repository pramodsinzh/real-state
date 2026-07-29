import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const { name, email, password, role, phoneNumber } = await req.json()

  if (!email || !password || !role || !phoneNumber) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  if (!["tenant", "landlord"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  })

  if (role === "landlord") {
    await prisma.manager.create({
      data: { cognitoId: user.id, name, email, phoneNumber },
    })
  } else {
    await prisma.tenant.create({
      data: { cognitoId: user.id, name, email, phoneNumber },
    })
  }

  return NextResponse.json({ id: user.id, email: user.email, role: user.role })
}