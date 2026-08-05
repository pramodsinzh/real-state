import type { Request, Response } from "express"
import prisma from "../lib/prisma.js"

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params

    if (!cognitoId || typeof cognitoId !== "string") {
      res.status(400).json({ error: "Invalid cognitoId" })
      return
    }

    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    })
    if (tenant) {
      res.json(tenant)
    } else {
      res.status(404).json({ error: "Tenant not found" })
    }
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving tenant: ${error.message}` })
  }
}

export const createTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body
    const tenant = await prisma.tenant.create({
      data: { cognitoId, name, email, phoneNumber },
    })
    res.status(201).json(tenant)
  } catch (error: any) {
    res.status(500).json({ message: `Error creating tenant: ${error.message}` })
  }
}

export const updateTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params

    if (!cognitoId || typeof cognitoId !== "string") {
      res.status(400).json({ error: "Invalid cognitoId" })
      return
    }

    const { name, email, phoneNumber } = req.body

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: { name, email, phoneNumber },
    })

    res.status(200).json(updatedTenant)
  } catch (error: any) {
    res.status(500).json({ message: `Error updating tenant: ${error.message}` })
  }
}