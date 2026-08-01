import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: "tenant" | "manager"
  }
}

const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables")
}

export const authMiddleware = (allowedRoles: ("tenant" | "manager")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
        id: string
        role: "tenant" | "manager"
      }

      req.user = decoded

      const hasAccess = allowedRoles.includes(decoded.role)
      if (!hasAccess) {
        res.status(403).json({ message: "Access Denied" })
        return
      }
    } catch (err) {
      console.error("Failed to verify token:", err)
      res.status(400).json({ message: "Invalid token" })
      return
    }

    next()
  }
}