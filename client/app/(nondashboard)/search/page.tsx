"use client"

import { NAVBAR_HEIGHT } from '@/lib/constants'
import { useAppDispatch, useAppSelector } from '@/state/redux'
import { useSearchParams } from 'next/navigation'
import FiltersBar from './FiltersBar'
import FiltersFull from './FiltersFull'
import { useEffect } from 'react'
import { cleanParams } from '@/lib/utils'
import { setFilters, toggleFiltersFullOpen } from '@/state'
import Map from './Map'
import Listings from './Listings'
import { X } from 'lucide-react'


const SearchPage = () => {
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen)

  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "coordinates") {
          acc[key] = value.split(",").map(Number);
        } else {
          acc[key] = value === "any" ? null : value;
        }

        return acc;
      },
      {}
    );

    const cleanedFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanedFilters));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='w-full mx-auto px-3 sm:px-5 flex flex-col'
      style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}>
      <FiltersBar />

      <div className="relative flex-1 min-h-0">
        <div className="flex flex-col lg:flex-row h-full gap-3 mb-5 min-h-0">
          {/* Map + Listings stack on mobile, sit side by side on desktop */}
          <div className="flex flex-col md:flex-row flex-1 gap-3 min-h-0 order-2 lg:order-1">
            <div className="h-[300px] md:h-full md:flex-1 min-h-0">
              <Map />
            </div>
            <div className="flex-1 md:basis-5/12 md:flex-none overflow-y-auto min-h-0">
              <Listings />
            </div>
          </div>
        </div>

        {/* Full filters: inline column on desktop, full-screen overlay on mobile */}
        {isFiltersFullOpen && (
          <>
            {/* Mobile overlay backdrop */}
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
              <div className="lg:hidden flex justify-end p-3 bg-white sticky top-0 z-10">
                <button
                  onClick={() => dispatch(toggleFiltersFullOpen())}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <FiltersFull />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage