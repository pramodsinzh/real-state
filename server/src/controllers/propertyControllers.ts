import type { Response } from "express"
import { Prisma, type Amenity, type Highlight, type Location, type PropertyType } from "@prisma/client"
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

const uploadPropertyPhotos = async (files: Express.Multer.File[]): Promise<string[]> => {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
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
    )
  )
}

const geocodeAddress = async (
  address: string,
  city: string,
  state: string,
  postalCode: string,
  country: string
): Promise<{ longitude: number; latitude: number } | null> => {
  const geocodeQuery = [address, city, state, postalCode, country].filter(Boolean).join(", ")
  const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: geocodeQuery,
    format: "json",
    limit: "1",
  }).toString()}`

  const geocodingResponse = await axios.get(geocodingUrl, {
    headers: {
      "User-Agent": "RentifulRealEstateApp/1.0 (contact@rentiful.app)",
      "Accept-Language": "en",
    },
  })

  const result = geocodingResponse.data?.[0]
  if (!result?.lon || !result?.lat) return null

  return {
    longitude: parseFloat(result.lon),
    latitude: parseFloat(result.lat),
  }
}

const parseStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
  if (typeof value !== "string" || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string")
    }
  } catch {
    // fall through to comma-separated parsing
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean)
}

const parseEnumList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value !== "string" || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    // fall through
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean)
}

const parseOptionalBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined
  return value === true || value === "true"
}

const parseOptionalFloat = (value: unknown): number | undefined => {
  if (value === undefined || value === "") return undefined
  return parseFloat(String(value))
}

const parseOptionalInt = (value: unknown): number | undefined => {
  if (value === undefined || value === "") return undefined
  return parseInt(String(value), 10)
}

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
      // ~500km radius using true geographic meters (not degrees)
      const radiusInMeters = 500_000

      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusInMeters}
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

    const geocodeQuery = [address, city, state, postalCode, country]
      .filter(Boolean)
      .join(", ")

    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: geocodeQuery,
      format: "json",
      limit: "1",
    }).toString()}`

    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RentifulRealEstateApp/1.0 (contact@rentiful.app)",
        "Accept-Language": "en",
      },
    })

    const result = geocodingResponse.data?.[0]
    if (!result?.lon || !result?.lat) {
      res.status(400).json({
        message: `Could not find coordinates for "${geocodeQuery}". Check the address and try again.`,
      })
      return
    }

    const longitude = parseFloat(result.lon)
    const latitude = parseFloat(result.lat)

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

export const updateProperty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const { id } = req.params
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid property id" })
      return
    }

    const propertyId = Number(id)
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { location: true },
    })

    if (!existing) {
      res.status(404).json({ message: "Property not found" })
      return
    }

    if (existing.managerCognitoId !== req.user.id) {
      res.status(403).json({ message: "You can only edit your own properties" })
      return
    }

    const files = (req.files as Express.Multer.File[]) || []
    const { address, city, state, country, postalCode, existingPhotoUrls, ...propertyData } = req.body

    const uploadedPhotoUrls = await uploadPropertyPhotos(files)
    const keptPhotoUrls = parseStringList(existingPhotoUrls)
    const photoUrls = [...keptPhotoUrls, ...uploadedPhotoUrls]

    if (photoUrls.length === 0) {
      res.status(400).json({ message: "At least one photo is required" })
      return
    }

    const nextAddress = address ?? existing.location.address
    const nextCity = city ?? existing.location.city
    const nextState = state ?? existing.location.state
    const nextCountry = country ?? existing.location.country
    const nextPostalCode = postalCode ?? existing.location.postalCode

    const addressChanged =
      nextAddress !== existing.location.address ||
      nextCity !== existing.location.city ||
      nextState !== existing.location.state ||
      nextCountry !== existing.location.country ||
      nextPostalCode !== existing.location.postalCode

    if (addressChanged) {
      const coords = await geocodeAddress(nextAddress, nextCity, nextState, nextPostalCode, nextCountry)
      if (!coords) {
        res.status(400).json({
          message: `Could not find coordinates for the updated address. Check the address and try again.`,
        })
        return
      }

      await prisma.$queryRaw`
        UPDATE "Location"
        SET
          address = ${nextAddress},
          city = ${nextCity},
          state = ${nextState},
          country = ${nextCountry},
          "postalCode" = ${nextPostalCode},
          coordinates = ST_SetSRID(ST_MakePoint(${coords.longitude}, ${coords.latitude}), 4326)
        WHERE id = ${existing.locationId}
      `
    }

    const data: Prisma.PropertyUpdateInput = {
      name: propertyData.name ?? existing.name,
      description: propertyData.description ?? existing.description,
      photoUrls: { set: photoUrls },
    }

    if (propertyData.amenities !== undefined) {
      data.amenities = parseEnumList(propertyData.amenities) as Amenity[]
    }
    if (propertyData.highlights !== undefined) {
      data.highlights = parseEnumList(propertyData.highlights) as Highlight[]
    }

    const isPetsAllowed = parseOptionalBoolean(propertyData.isPetsAllowed)
    if (isPetsAllowed !== undefined) data.isPetsAllowed = isPetsAllowed

    const isParkingIncluded = parseOptionalBoolean(propertyData.isParkingIncluded)
    if (isParkingIncluded !== undefined) data.isParkingIncluded = isParkingIncluded

    const pricePerMonth = parseOptionalFloat(propertyData.pricePerMonth)
    if (pricePerMonth !== undefined) data.pricePerMonth = pricePerMonth

    const securityDeposit = parseOptionalFloat(propertyData.securityDeposit)
    if (securityDeposit !== undefined) data.securityDeposit = securityDeposit

    const applicationFee = parseOptionalFloat(propertyData.applicationFee)
    if (applicationFee !== undefined) data.applicationFee = applicationFee

    const beds = parseOptionalInt(propertyData.beds)
    if (beds !== undefined) data.beds = beds

    const baths = parseOptionalFloat(propertyData.baths)
    if (baths !== undefined) data.baths = baths

    const squareFeet = parseOptionalInt(propertyData.squareFeet)
    if (squareFeet !== undefined) data.squareFeet = squareFeet

    if (propertyData.propertyType) {
      data.propertyType = propertyData.propertyType as PropertyType
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data,
      include: {
        location: true,
        manager: true,
      },
    })

    res.json(updatedProperty)
  } catch (error: any) {
    res.status(500).json({ message: `Error updating property: ${error.message}` })
  }
}

export const deleteProperty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const { id } = req.params
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid property id" })
      return
    }

    const propertyId = Number(id)
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!existing) {
      res.status(404).json({ message: "Property not found" })
      return
    }

    if (existing.managerCognitoId !== req.user.id) {
      res.status(403).json({ message: "You can only delete your own properties" })
      return
    }

    await prisma.$transaction(async (tx) => {
      await tx.application.updateMany({
        where: { propertyId },
        data: { leaseId: null },
      })
      await tx.payment.deleteMany({
        where: { lease: { propertyId } },
      })
      await tx.application.deleteMany({ where: { propertyId } })
      await tx.lease.deleteMany({ where: { propertyId } })
      await tx.property.update({
        where: { id: propertyId },
        data: {
          favoritedBy: { set: [] },
          tenants: { set: [] },
        },
      })
      await tx.property.delete({ where: { id: propertyId } })

      const remainingAtLocation = await tx.property.count({
        where: { locationId: existing.locationId },
      })
      if (remainingAtLocation === 0) {
        await tx.$executeRaw`DELETE FROM "Location" WHERE id = ${existing.locationId}`
      }
    })

    res.json({ message: "Property deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: `Error deleting property: ${error.message}` })
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