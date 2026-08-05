import type { Request, Response } from "express" 
import prisma from "../lib/prisma.js"

export const getManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params

    if (!cognitoId || typeof cognitoId !== "string") {
      res.status(400).json({ error: "Invalid cognitoId" })
      return
    }

    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    })
    if (manager) {
      res.json(manager)
    } else {
      res.status(404).json({ error: "Manager not found" })
    }
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving manager: ${error.message}` })
  }
}

export const createManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body
    const manager = await prisma.manager.create({
      data: { cognitoId, name, email, phoneNumber },
    })
    res.status(201).json(manager)
  } catch (error: any) {
    res.status(500).json({ message: `Error creating manager: ${error.message}` })
  }
}

export const updateManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params

    if (!cognitoId || typeof cognitoId !== "string") {
      res.status(400).json({ error: "Invalid cognitoId" })
      return
    }

    const { name, email, phoneNumber } = req.body

    const updateManager = await prisma.manager.update({
      where: { cognitoId },
      data: { name, email, phoneNumber },
    })

    res.status(200).json(updateManager)
  } catch (error: any) {
    res.status(500).json({ message: `Error updating manager: ${error.message}` })
  }
}