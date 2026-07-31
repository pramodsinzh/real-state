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

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" })
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Missing token" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      id: string
      role: "tenant" | "manager"
    }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

export function requireRole(...roles: ("tenant" | "manager")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" })
    }
    next()
  }
}