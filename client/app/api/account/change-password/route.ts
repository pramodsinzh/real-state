import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { changePasswordSchema } from "@/lib/schemas"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = changePasswordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || !user.password) {
    return NextResponse.json(
      { error: "Password change is not available for this account" },
      { status: 400 }
    )
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  })

  return NextResponse.json({ success: true })
}