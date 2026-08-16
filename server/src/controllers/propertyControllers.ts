import type { Response } from "express"
import { Prisma, type Location } from "@prisma/client"
import { wktToGeoJSON } from "@terraformer/wkt"
import { v2 as cloudinary } from "cloudinary"
import axios from "axios"
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js"
import prisma from "../lib/prisma.js"

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary environment variables are not set")
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

export const getProperties = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { favoriteIds, priceMin, priceMax, beds, baths, propertyType, squareFeetMin, squareFeetMax, amenities, availableFrom, latitude, longitude } = req.query

    let whereConditions: Prisma.Sql[] = []

    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number)
      whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`)
    }
    if (priceMin) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`)
    }
    if (priceMax) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`)
    }
    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`)
    }
    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`)
    }
    if (squareFeetMin) {
      whereConditions.push(Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`)
    }
    if (squareFeetMax) {
      whereConditions.push(Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`)
    }
    if (propertyType && propertyType !== "any") {
      whereConditions.push(Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`)
    }
    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",")
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`)
    }
    if (availableFrom && availableFrom !== "any") {
      const availableFromDate =
        typeof availableFrom === "string" ? availableFrom : null

      if (availableFromDate) {
        const date = new Date(availableFromDate)

        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l
              WHERE l."propertyId" = p.id
              AND l."startDate" <= ${date.toISOString()}
            )`
          )
        }
      }
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string)
      const lng = parseFloat(longitude as string)
      const radiusInKilometers = 1000
      const degrees = radiusInKilometers / 111

      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`
      )
    }

    const completeQuery = Prisma.sql`
      SELECT
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${whereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
        : Prisma.empty
      }
    `

    const properties = await prisma.$queryRaw(completeQuery)
    res.json(properties)
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving properties: ${error.message}` })
  }
}

export const getProperty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Property id is required" })
      return
    }

    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: { location: true, manager: true },
    })
    if (property) {
      const coordinates: { coordinates: string }[] = await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "")
      const longitude = geoJSON.coordinates[0]
      const latitude = geoJSON.coordinates[1]

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      }
      res.json(propertyWithCoordinates)
    } else {
      res.status(404).json({ message: "Property not found" })
    }
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving property: ${error.message}` })
  }
}

export const createProperty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const files = req.files as Express.Multer.File[]
    const { address, city, state, country, postalCode, ...propertyData } = req.body
    const managerCognitoId = req.user.id

    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const result = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "rentiful/properties",
              resource_type: "image",
            },
            (error, result) => {
              if (error || !result) return reject(error)
              resolve(result.secure_url)
            }
          )
          uploadStream.end(file.buffer)
        })
        return result
      })
    )

    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      street: address,
      city,
      country,
      postalcode: postalCode,
      format: "json",
      limit: "1",
    }).toString()}`

    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com",
      },
    })

    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
          parseFloat(geocodingResponse.data[0]?.lon),
          parseFloat(geocodingResponse.data[0]?.lat),
        ]
        : [0, 0]

    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;`

    if (!location) {
      res.status(500).json({ message: "Failed to create location" })
      return
    }

    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    })

    res.status(201).json(newProperty)
  } catch (error: any) {
    res.status(500).json({ message: `Error creating property: ${error.message}` })
  }
}

export const getPropertyLeases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!id || typeof id !== "string" || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid property id" })
      return
    }

    const leases = await prisma.lease.findMany({
      where: { propertyId: Number(id) },
      include: { tenant: true },
    })

    res.json(leases)
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving property leases: ${error.message}` })
  }
}