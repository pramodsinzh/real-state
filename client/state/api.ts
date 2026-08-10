import { Manager, Property, Tenant } from "@/types/prismaTypes"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { getSession } from "next-auth/react"
import { FiltersState } from "."
import { cleanParams, withToast } from "@/lib/utils"

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

    updateManagerSettings: build.mutation<Manager, { cognitoId: string } & Partial<Manager>>({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
    }),

    // property related endpoints
    getProperties: build.query<PropertyWithLocation[], Partial<FiltersState> & { favoriteIds?: number[] }>({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Properties" as const, id })),
            { type: "Properties", id: "LIST" },
          ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),

    // tenant related endpoints
    getTenant: build.query<TenantWithFavorites, string>({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load tenant profile.",
        });
      },
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Properties" as const, id })),
            { type: "Properties", id: "LIST" },
          ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch current residences.",
        });
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

    addFavoriteProperty: build.mutation
      <TenantWithFavorites,
        { cognitoId: string; propertyId: number }
      >({
        query: ({ cognitoId, propertyId }) => ({
          url: `tenants/${cognitoId}/favorites/${propertyId}`,
          method: "POST",
        }),
        invalidatesTags: (result) => [
          { type: "Tenants", id: result?.id },
          { type: "Properties", id: "LIST" },
        ],
        async onQueryStarted(_, { queryFulfilled }) {
          await withToast(queryFulfilled, {
            success: "Added to favorites!!",
            error: "Failed to add to favorites",
          });
        },
      }),

    removeFavoriteProperty: build.mutation
      <TenantWithFavorites,
        { cognitoId: string; propertyId: number }
      >({
        query: ({ cognitoId, propertyId }) => ({
          url: `tenants/${cognitoId}/favorites/${propertyId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result) => [
          { type: "Tenants", id: result?.id },
          { type: "Properties", id: "LIST" },
        ],
        async onQueryStarted(_, { queryFulfilled }) {
          await withToast(queryFulfilled, {
            success: "Removed from favorites!",
            error: "Failed to remove from favorites.",
          });
        },
      }),
  }),
})

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetTenantQuery,
  useGetCurrentResidencesQuery,
} = api