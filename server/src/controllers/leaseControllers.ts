import type { Response } from "express"
import prisma from "../lib/prisma.js"
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js" 

export const getLeases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const leases = await prisma.lease.findMany({
      where:
        req.user.role === "manager"
          ? { property: { managerCognitoId: req.user.id } }
          : { tenantCognitoId: req.user.id },
      include: {
        tenant: true,
        property: true,
      },
    })

    res.json(leases)
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving leases: ${error.message}` })
  }
}

export const getLeasePayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!id || typeof id !== "string" || isNaN(Number(id))) {
      res.status(400).json({ error: "Invalid lease id" })
      return
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const lease = await prisma.lease.findUnique({
      where: { id: Number(id) },
      include: { property: true },
    })

    if (!lease) {
      res.status(404).json({ message: "Lease not found" })
      return
    }

    const isOwner =
      (req.user.role === "tenant" && lease.tenantCognitoId === req.user.id) ||
      (req.user.role === "manager" && lease.property.managerCognitoId === req.user.id)

    if (!isOwner) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    })

    res.json(payments)
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving lease payments: ${error.message}` })
  }
}