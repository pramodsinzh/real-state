"use client"

import { NAVBAR_HEIGHT } from '@/lib/constants'
import { useAppDispatch, useAppSelector } from '@/state/redux'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import FiltersBar from './FiltersBar'
import FiltersFull from './FiltersFull'
import { useEffect } from 'react'
import { cleanParams } from '@/lib/utils'
import { FiltersState, setFilters, toggleFiltersFullOpen } from '@/state'
import Map from './Map'
import Listings from './Listings'

async function geocodeLocation(location: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
        q: location,
        format: "json",
        limit: "1",
      }).toString()}`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    )
    const data = await response.json()
    if (data?.[0]) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)]
    }
  } catch (error) {
    console.error("Error geocoding location:", error)
  }
  return null
}

const SearchPage = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen)

  useEffect(() => {
    let cancelled = false

    const hydrateFromQuery = async () => {
      const params = Object.fromEntries(searchParams.entries())
      if (Object.keys(params).length === 0) return

      const next: Partial<FiltersState> = {}

      if (params.location) next.location = params.location
      if (params.beds) next.beds = params.beds
      if (params.baths) next.baths = params.baths
      if (params.propertyType) next.propertyType = params.propertyType
      if (params.availableFrom) next.availableFrom = params.availableFrom

      if (params.priceRange) {
        next.priceRange = params.priceRange
          .split(",")
          .map((v) => (v === "" ? null : Number(v))) as [number, number] | [null, null]
      }

      if (params.squareFeet) {
        next.squareFeet = params.squareFeet
          .split(",")
          .map((v) => (v === "" ? null : Number(v))) as [number, number] | [null, null]
      }

      if (params.amenities) {
        next.amenities = params.amenities.split(",").filter(Boolean)
      }

      if (params.coordinates) {
        const [lng, lat] = params.coordinates.split(",").map(Number)
        if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
          next.coordinates = [lng, lat]
        }
      } else if (params.lat && params.lng) {
        const lat = Number(params.lat)
        const lng = Number(params.lng)
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          next.coordinates = [lng, lat]
        }
      } else if (params.location) {
        const coords = await geocodeLocation(params.location)
        if (coords) next.coordinates = coords
      }

      if (cancelled || Object.keys(next).length === 0) return

      const cleaned = cleanParams(next)
      dispatch(setFilters(cleaned))

      // Normalize URL to include coordinates when we resolved them from location-only query
      if (next.coordinates && !params.coordinates) {
        const updated = new URLSearchParams(searchParams.toString())
        updated.delete("lat")
        updated.delete("lng")
        updated.set("coordinates", next.coordinates.join(","))
        if (next.location) updated.set("location", next.location)
        router.replace(`${pathname}?${updated.toString()}`, { scroll: false })
      }
    }

    hydrateFromQuery()
    return () => {
      cancelled = true
    }
  }, [searchParams, dispatch, pathname, router])

  return (
    <div
      className="w-full mx-auto px-3 sm:px-5 flex flex-col md:h-[calc(100vh-var(--navbar-h))] md:overflow-hidden"
      style={{ ["--navbar-h" as string]: `${NAVBAR_HEIGHT}px` }}
    >
      <FiltersBar />

      <div className="relative flex flex-col flex-1 md:min-h-0">
        <div className="flex flex-col lg:flex-row flex-1 gap-3 mb-5 md:min-h-0 md:overflow-hidden">
          {/* Map + Listings: stack on mobile (page scrolls), side-by-side on desktop */}
          <div className="flex flex-col md:flex-row flex-1 gap-3 md:min-h-0 order-2 lg:order-1">
            <div className="h-[320px] w-full shrink-0 md:h-full md:flex-1 md:min-h-0">
              <Map />
            </div>
            <div className="w-full shrink-0 md:basis-5/12 md:flex-none md:h-full md:overflow-y-auto md:min-h-0">
              <Listings />
            </div>
          </div>
        </div>

        {/* Full filters: inline column on desktop, full-screen overlay on mobile */}
        {isFiltersFullOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => dispatch(toggleFiltersFullOpen())}
            />
            <div
              className={`
                fixed inset-y-0 left-0 z-50 w-full sm:w-96 overflow-auto
                lg:static lg:z-auto lg:w-3/12 lg:h-full lg:mb-5
                transition-transform duration-300 ease-in-out
              `}
              style={{ top: `${NAVBAR_HEIGHT}px`, paddingTop: 0 }}
            >
              <FiltersFull />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
