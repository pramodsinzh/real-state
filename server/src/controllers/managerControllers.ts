import { PrismaClient } from "@prisma/client/extension"
import { type Request, type Response } from "express"


const prisma = new PrismaClient()

export const getManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cognitoId } = req.params
        const manager = await prisma.manager.findUnique({
            where: { cognitoId }, 
        })
        if (manager) {
            res.json(manager)
        } else {
            res.status(404).json({ error: "Manager not found" })
        }
    } catch (error: any) {
        res.status(500).json({ message: `Error retriving manager: ${error.message}` })
    }
}

export const createManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body
        const manager = await prisma.manager.create({
             data: {
                cognitoId, 
                name, 
                email, 
                phoneNumber
             }
        })
        res.status(201).json(manager)
    } catch (error: any) {
        res.status(500).json({ message: `Error creating manager: ${error.message}` })
    }
}