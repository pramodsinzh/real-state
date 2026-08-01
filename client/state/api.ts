import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { getSession } from "next-auth/react"
// import { FiltersState } from "."

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URL,
    prepareHeaders: async (headers) => {
      const res = await fetch("/api/auth/token")
      if (res.ok) {
        const { token } = await res.json()
        if (token) {
          headers.set("Authorization", `Bearer ${token}`)
        }
      }
      return headers
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "Managers",
    "Tenants",
    "Properties",
    "PropertyDetails",
    "Leases",
    "Payments",
    "Applications",
  ],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const session = await getSession()

          if (!session?.user?.id || !session.user.role) {
            return { error: { status: 401, data: "Not authenticated" } }
          }

          const { id, role, name, email } = session.user

          const endpoint = role === "manager" ? `/managers/${id}` : `/tenants/${id}`
          const userDetailsResponse = await fetchWithBQ(endpoint)

          if (userDetailsResponse.error) {
            return { error: userDetailsResponse.error }
          }

          const userData = {
            cognitoInfo: { id, name, email }, // kept as `cognitoInfo` to match your existing User type shape
            userInfo: userDetailsResponse.data,
            userRole: role,
          }

          return { data: userData as User }
        } catch (error: any) {
          return {
            error: { status: 500, data: error.message ?? "Could not fetch user data" },
          }
        }
      },
    }),
  }),
})

export const { useGetAuthUserQuery } = api