import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { role, phoneNumber } = await req.json()
  if (!["tenant", "manager"].includes(role) || !phoneNumber) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  })

  if (role === "manager") {
    await prisma.manager.create({
      data: { cognitoId: user.id, name: user.name ?? "", email: user.email ?? "", phoneNumber },
    })
  } else {
    await prisma.tenant.create({
      data: { cognitoId: user.id, name: user.name ?? "", email: user.email ?? "", phoneNumber },
    })
  }

  return NextResponse.json({ role })
}