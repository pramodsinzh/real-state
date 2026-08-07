import type { Response } from "express"
import prisma from "../lib/prisma.js"
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js" 

export const getLeases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
     const leases = await prisma.lease.findMany({
        include: {
            tenant: true,
            property: true
        }
     })
     res.json(leases)
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving leases: ${error.message}` })
  }
}
export const getLeasePayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {id} = req.params
     const payment = await prisma.payment.findMany({
        where: {leaseId: Number(id)}
     })
     res.json(payment)
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving lease payments: ${error.message}` })
  }
}