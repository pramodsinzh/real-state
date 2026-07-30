"use client"

import { signOut } from "next-auth/react"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

async function getServerToken(): Promise<string> {
  const res = await fetch("/api/auth/token")
  if (!res.ok) throw new ApiError("Not authenticated", 401)
  const { token } = await res.json()
  return token
}

async function serverFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getServerToken()

  const res = await fetch(`${SERVER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (res.status === 401) {
    await signOut({ callbackUrl: "/login" })
    throw new ApiError("Unauthorized", 401)
  }
  if (res.status === 403) {
    throw new ApiError("You don't have permission to do that", 403)
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(data.error ?? "Something went wrong", res.status)
  }

  return res.json()
}

export const serverApi = {
  get: <T>(path: string) => serverFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    serverFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    serverFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => serverFetch<T>(path, { method: "DELETE" }),
}

export { ApiError }