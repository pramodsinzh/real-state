import type { Response } from "express"
import prisma from "../lib/prisma.js"
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js"
import { wktToGeoJSON } from "@terraformer/wkt"

export const getManager = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

export const createManager = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

export const updateManager = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params

    if (!cognitoId || typeof cognitoId !== "string") {
      res.status(400).json({ error: "Invalid cognitoId" })
      return
    }

    if (req.user?.id !== cognitoId) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const { name, email, phoneNumber } = req.body
    const updatedManager = await prisma.manager.update({
      where: { cognitoId },
      data: { name, email, phoneNumber },
    })

    res.status(200).json(updatedManager)
  } catch (error: any) {
    res.status(500).json({ message: `Error updating manager: ${error.message}` })
  }
}

export const getManagerProperties = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params

    if (!cognitoId || typeof cognitoId !== "string") {
      res.status(400).json({ error: "Invalid cognitoId" })
      return
    }

    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId },
      include: { location: true },
    })

    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] = await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "")
        const longitude = geoJSON.coordinates[0]
        const latitude = geoJSON.coordinates[1]

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        }
      })
    )

    res.json(propertiesWithFormattedLocation)
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving manager properties: ${error.message}` })
  }
}