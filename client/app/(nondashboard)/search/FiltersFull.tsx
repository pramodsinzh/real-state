"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { AmenityIcons, PropertyTypeIcons } from '@/lib/constants'
import { cleanParams, cn, formatEnumString } from '@/lib/utils'
import { FiltersState, initialState, setFilters, toggleFiltersFullOpen } from '@/state'
import { useAppSelector } from '@/state/redux'
import { debounce } from 'lodash'
import { Search, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const FiltersFull = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const filters = useAppSelector((state) => state.global.filters)
    const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen)
    const [localFilters, setLocalFilters] = useState(initialState.filters)

    const updateURL = debounce((newFilters: FiltersState) => {
        const cleanFilters = cleanParams(newFilters);
        const updatedSearchParams = new URLSearchParams();

        Object.entries(cleanFilters).forEach(([key, value]) => {
            updatedSearchParams.set(
                key,
                Array.isArray(value) ? value.join(",") : value.toString()
            );
        });

        router.push(`${pathname}?${updatedSearchParams.toString()}`);
    });

    const handleSubmit = () => {
        dispatch(setFilters(localFilters))
        updateURL(localFilters)
    }
    const handleReset = () => {
        setLocalFilters(initialState.filters)
        dispatch(setFilters(initialState.filters))
        updateURL(initialState.filters)
    }
    const handleAmenityChange = (amenity: AmenityEnum) => {
        setLocalFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleLocationSearch = async () => {
        if (!localFilters.location) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
                    q: localFilters.location,
                    format: "json",
                    limit: "1",
                }).toString()}`,
                {
                    headers: {
                        "Accept-Language": "en",
                    },
                }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lon, lat } = data[0];
                setLocalFilters((prev) => ({
                    ...prev,
                    coordinates: [parseFloat(lon), parseFloat(lat)] as [number, number],
                }));
            }
        } catch (err) {
            console.error("Error searching location:", err);
        }
    };

    const bedsLabel = localFilters.beds === "any" ? "Any Beds" : `${localFilters.beds}+ bed${localFilters.beds === "1" ? "" : "s"}`
    const bathsLabel = localFilters.baths === "any" ? "Any Baths" : `${localFilters.baths}+ bath${localFilters.baths === "1" ? "" : "s"}`

    if (!isFiltersFullOpen) return null;
    return (
        <div className="bg-white lg:rounded-2xl lg:border lg:border-gray-200 px-4 sm:px-6 h-full overflow-auto pb-10">
            {/* Mobile header: title + close in one compact row */}
            <div className="lg:hidden sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                <button
                    type="button"
                    onClick={() => dispatch(toggleFiltersFullOpen())}
                    className="inline-flex size-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                    aria-label="Close filters"
                >
                    <X className="size-5" />
                </button>
            </div>

            <div className="flex flex-col space-y-7 pt-5 lg:pt-6">

                {/* Location */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2.5 text-sm">Location</h4>
                    <div className="flex items-center h-11 rounded-full border border-gray-200 overflow-hidden transition-colors duration-300 focus-within:border-gray-400">
                        <Input
                            placeholder="Enter location"
                            value={localFilters.location}
                            onChange={(e) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    location: e.target.value,
                                }))
                            }
                            className="h-full border-0 rounded-none text-sm shadow-none focus-visible:ring-0"
                        />
                        <Button
                            onClick={handleLocationSearch}
                            variant="ghost"
                            className="h-full rounded-none border-0 border-l border-gray-200 shadow-none px-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Property Type */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2.5 text-sm">Property Type</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                            <div
                                key={type}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1.5 p-4 border rounded-xl cursor-pointer transition-colors duration-300",
                                    localFilters.propertyType === type
                                        ? "border-gray-900 bg-gray-50"
                                        : "border-gray-200 hover:border-gray-400"
                                )}
                                onClick={() =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        propertyType: type as PropertyTypeEnum,
                                    }))
                                }
                            >
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                                <span className="text-xs sm:text-sm text-gray-700 text-center">{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Price Range (Monthly)</h4>
                    <div className="px-1">
                        <Slider
                            min={0}
                            max={10000}
                            step={100}
                            value={[
                                localFilters.priceRange[0] ?? 0,
                                localFilters.priceRange[1] ?? 10000,
                            ]}
                            onValueChange={(value: any) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    priceRange: value as [number, number],
                                }))
                            }
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>${localFilters.priceRange[0] ?? 0}</span>
                        <span>${localFilters.priceRange[1] ?? 10000}</span>
                    </div>
                </div>

                {/* Beds and Baths */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2.5 text-sm">Beds</h4>
                        <Select
                            value={localFilters.beds || "any"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({ ...prev, beds: value ?? "any" }))
                            }
                        >
                            <SelectTrigger className="w-full h-11 data-[size=default]:h-11 rounded-xl border-gray-200">
                                <SelectValue>{bedsLabel}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any beds</SelectItem>
                                <SelectItem value="1">1+ bed</SelectItem>
                                <SelectItem value="2">2+ beds</SelectItem>
                                <SelectItem value="3">3+ beds</SelectItem>
                                <SelectItem value="4">4+ beds</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2.5 text-sm">Baths</h4>
                        <Select
                            value={localFilters.baths || "any"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({ ...prev, baths: value ?? "any" }))
                            }
                        >
                            <SelectTrigger className="w-full h-11 data-[size=default]:h-11 rounded-xl border-gray-200">
                                <SelectValue>{bathsLabel}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any baths</SelectItem>
                                <SelectItem value="1">1+ bath</SelectItem>
                                <SelectItem value="2">2+ baths</SelectItem>
                                <SelectItem value="3">3+ baths</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Square Feet */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Square Feet</h4>
                    <div className="px-1">
                        <Slider
                            min={0}
                            max={5000}
                            step={100}
                            value={[
                                localFilters.squareFeet[0] ?? 0,
                                localFilters.squareFeet[1] ?? 5000,
                            ]}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    squareFeet: value as [number, number],
                                }))
                            }
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>{localFilters.squareFeet[0] ?? 0} sq ft</span>
                        <span>{localFilters.squareFeet[1] ?? 5000} sq ft</span>
                    </div>
                </div>

                {/* Amenities */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2.5 text-sm">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
                            <div
                                key={amenity}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 border rounded-full cursor-pointer transition-colors duration-300",
                                    localFilters.amenities.includes(amenity as AmenityEnum)
                                        ? "border-gray-900 bg-gray-50"
                                        : "border-gray-200 hover:border-gray-400"
                                )}
                                onClick={() => handleAmenityChange(amenity as AmenityEnum)}
                            >
                                <Icon className="w-4 h-4 text-gray-700 shrink-0" />
                                <Label className="cursor-pointer text-xs sm:text-sm text-gray-700">
                                    {formatEnumString(amenity)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available From */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2.5 text-sm">Available From</h4>
                    <Input
                        type="date"
                        value={
                            localFilters.availableFrom !== "any"
                                ? localFilters.availableFrom
                                : ""
                        }
                        onChange={(e) =>
                            setLocalFilters((prev) => ({
                                ...prev,
                                availableFrom: e.target.value ? e.target.value : "any",
                            }))
                        }
                        className="h-11 rounded-xl border-gray-200"
                    />
                </div>

                {/* Apply and Reset buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white pb-5 -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-gray-100 lg:static lg:border-0 lg:mx-0 lg:px-0 lg:pt-2 lg:pb-4">
                    <button
                        type="button"
                        onClick={() => {
                            handleSubmit()
                            if (window.innerWidth < 1024) dispatch(toggleFiltersFullOpen())
                        }}
                        className="flex-1 min-h-12 h-12 px-5 text-sm font-medium bg-gray-900 text-white rounded-full transition-colors duration-300 hover:bg-secondary-500"
                    >
                        Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 min-h-12 h-12 px-5 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-900 transition-colors duration-300 hover:bg-gray-50"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </div>

    )
}

export default FiltersFull