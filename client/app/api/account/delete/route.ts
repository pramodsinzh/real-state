import { NextResponse } from "next/server"
import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const role = session.user.role

  try {
    if (role === "manager") {
      const manager = await prisma.manager.findUnique({
        where: { cognitoId: userId },
        include: { managedProperties: true },
      })

      if (manager && manager.managedProperties.length > 0) {
        return NextResponse.json(
          {
            error:
              "You still have active property listings. Please remove all your properties before deleting your account.",
          },
          { status: 400 }
        )
      }
    }

    if (role === "tenant") {
      const tenant = await prisma.tenant.findUnique({
        where: { cognitoId: userId },
        include: { leases: true },
      })

      if (tenant && tenant.leases.length > 0) {
        return NextResponse.json(
          {
            error:
              "You have lease history associated with your account. Please contact support to delete your account.",
          },
          { status: 400 }
        )
      }
    }

    await prisma.$transaction(async (tx) => {
      if (role === "manager") {
        await tx.manager.deleteMany({ where: { cognitoId: userId } })
      } else if (role === "tenant") {
        await tx.tenant.deleteMany({ where: { cognitoId: userId } })
      }
      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to delete account" },
      { status: 500 }
    )
  }
}