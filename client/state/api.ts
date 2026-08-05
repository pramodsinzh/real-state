import { Manager, Tenant } from "@/types/prismaTypes"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { getSession } from "next-auth/react"

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
            cognitoInfo: { id, name, email, hasPassword: session.user.hasPassword },
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
    updateTenantSettings: build.mutation<Tenant, { cognitoId: string } & Partial<Tenant>>({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),
    updateManagerSettings: build.mutation<Manager, { cognitoId: string } & Partial<Manager>>({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
    }),
  }),
})

export const { useGetAuthUserQuery, useUpdateTenantSettingsMutation, useUpdateManagerSettingsMutation } = api