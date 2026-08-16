"use client"

import { useAppSelector } from '@/state/redux'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { debounce } from 'lodash'
import { FiltersState, setFilters, setViewMode, toggleFiltersFullOpen } from '@/state'
import { cleanParams, cn, formatPriceValue } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Filter, Grid, List, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PropertyTypeIcons } from '@/lib/constants'

const FiltersBar = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const filters = useAppSelector((state) => state.global.filters)
    const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen)
    const viewMode = useAppSelector((state) => state.global.viewMode)
    const [searchInput, setSearchInput] = useState(filters.location)

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

    const handleFilterChange = (
        key: string,
        value: any,
        isMin: boolean | null
    ) => {
        let newValue = value;

        if (key === "priceRange" || key === "squareFeet") {
            const currentArrayRange = [...filters[key]];
            if (isMin !== null) {
                const index = isMin ? 0 : 1;
                currentArrayRange[index] = value === "any" ? null : Number(value);
            }
            newValue = currentArrayRange;
        } else if (key === "coordinates") {
            newValue = value === "any" ? [0, 0] : value.map(Number);
        } else {
            newValue = value === "any" ? "any" : value;
        }

        const newFilters = { ...filters, [key]: newValue };
        dispatch(setFilters(newFilters));
        updateURL(newFilters);
    };

    const handleLocationSearch = async () => {
        if (!searchInput) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
                    q: searchInput,
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
                const newFilters = {
                    ...filters,
                    location: searchInput,
                    coordinates: [parseFloat(lon), parseFloat(lat)] as [number, number],
                };
                dispatch(setFilters(newFilters));
                updateURL(newFilters);
            }
        } catch (err) {
            console.error("Error searching location:", err);
        }
    };

    const bedsLabel = filters.beds === "any" ? "Any Beds" : `${filters.beds}+ bed${filters.beds === "1" ? "" : "s"}`
    const bathsLabel = filters.baths === "any" ? "Any Baths" : `${filters.baths}+ bath${filters.baths === "1" ? "" : "s"}`
    const propertyTypeLabel = !filters.propertyType || filters.propertyType === "any" ? "Any Property" : filters.propertyType

    const pillTrigger = "rounded-full border-gray-200 bg-white text-sm font-normal text-gray-700 shadow-none transition-colors duration-300 hover:border-gray-400 focus:ring-0 focus:ring-offset-0"

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full py-5 gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2"> 
                {/* All Filters */}
                <Button
                    variant="outline"
                    className={cn(
                        "gap-2 rounded-full border-gray-200 bg-white text-sm font-normal text-gray-700 shadow-none transition-colors duration-300 hover:bg-gray-100 hover:border-gray-400",
                        isFiltersFullOpen && "bg-gray-900 text-white border-gray-900 hover:bg-gray-900 hover:text-white"
                    )}
                    onClick={() => dispatch(toggleFiltersFullOpen())}
                >
                    <Filter className="w-3.5 h-3.5" />
                    <span>All Filters</span>
                </Button>

                {/* Search Location */}
                <div className="flex items-center rounded-full border border-gray-200 bg-white overflow-hidden transition-colors duration-300 focus-within:border-gray-400">
                    <Input
                        placeholder="Search location"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-40 border-0 rounded-none bg-transparent text-sm shadow-none focus-visible:ring-0"
                    />
                    <Button
                        onClick={handleLocationSearch}
                        variant="ghost"
                        className="rounded-none border-0 border-l border-gray-200 shadow-none px-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <Search className="w-4 h-4" />
                    </Button>
                </div>

                {/* Price Range */}
                <div className="flex gap-2">
                    {/* Minimum Price Selector */}
                    <Select
                        value={filters.priceRange[0]?.toString() || "any"}
                        onValueChange={(value) =>
                            handleFilterChange("priceRange", value, true)
                        }
                    >
                        <SelectTrigger className={cn("w-[125px]", pillTrigger)}>
                            <SelectValue>
                                {formatPriceValue(filters.priceRange[0], true)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Min Price</SelectItem>
                            {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
                                <SelectItem key={price} value={price.toString()}>
                                    ${price / 1000}k+
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Maximum Price Selector */}
                    <Select
                        value={filters.priceRange[1]?.toString() || "any"}
                        onValueChange={(value) =>
                            handleFilterChange("priceRange", value, false)
                        }
                    >
                        <SelectTrigger className={cn("w-[125px]", pillTrigger)}>
                            <SelectValue>
                                {formatPriceValue(filters.priceRange[1], false)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Max Price</SelectItem>
                            {[1000, 2000, 3000, 5000, 10000].map((price) => (
                                <SelectItem key={price} value={price.toString()}>
                                    &lt;${price / 1000}k
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Beds and Baths */}
                <div className="flex gap-2">
                    {/* Beds */}
                    <Select
                        value={filters.beds}
                        onValueChange={(value) => handleFilterChange("beds", value, null)}
                    >
                        <SelectTrigger className={cn("w-[115px]", pillTrigger)}>
                            <SelectValue>{bedsLabel}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Beds</SelectItem>
                            <SelectItem value="1">1+ bed</SelectItem>
                            <SelectItem value="2">2+ beds</SelectItem>
                            <SelectItem value="3">3+ beds</SelectItem>
                            <SelectItem value="4">4+ beds</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Baths */}
                    <Select
                        value={filters.baths}
                        onValueChange={(value) => handleFilterChange("baths", value, null)}
                    >
                        <SelectTrigger className={cn("w-[115px]", pillTrigger)}>
                            <SelectValue>{bathsLabel}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Baths</SelectItem>
                            <SelectItem value="1">1+ bath</SelectItem>
                            <SelectItem value="2">2+ baths</SelectItem>
                            <SelectItem value="3">3+ baths</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Property Type */}
                <Select
                    value={filters.propertyType || "any"}
                    onValueChange={(value) =>
                        handleFilterChange("propertyType", value, null)
                    }
                >
                    <SelectTrigger className={cn("w-[140px]", pillTrigger)}>
                        <SelectValue>{propertyTypeLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="any">Any Property Type</SelectItem>
                        {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                            <SelectItem key={type} value={type}>
                                <div className="flex items-center">
                                    <Icon className="w-4 h-4 mr-2" />
                                    <span>{type}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-4">
                <div className="flex border border-gray-200 rounded-full overflow-hidden">
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-3 py-1 rounded-none transition-colors duration-300 hover:bg-gray-900 hover:text-white",
                            viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-600"
                        )}
                        onClick={() => dispatch(setViewMode("list"))}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-3 py-1 rounded-none transition-colors duration-300 hover:bg-gray-900 hover:text-white",
                            viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-600"
                        )}
                        onClick={() => dispatch(setViewMode("grid"))}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default FiltersBar