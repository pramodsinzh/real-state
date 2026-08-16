"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { setFilters } from '@/state'

const HeroSection = () => {
    const shouldReduceMotion = useReducedMotion()
    const dispatch = useDispatch()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    const handleSearch = async () => {
        const trimmedQuery = searchQuery.trim()
        if (!trimmedQuery) return

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
                    q: trimmedQuery,
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

            if (data && data.length > 0) {
                const { lon, lat } = data[0]
                const coordinates: [number, number] = [parseFloat(lon), parseFloat(lat)]

                dispatch(
                    setFilters({
                        location: trimmedQuery,
                        coordinates,
                    })
                )

                const params = new URLSearchParams({
                    location: trimmedQuery,
                    lat: lat,
                    lng: lon,
                })
                router.push(`/search?${params.toString()}`)
            }
        } catch (error) {
            console.error("Error searching location:", error)
        }
    }

    return (
        <div
            className='relative w-full'
            style={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
        >
            <Image
                src='/landing-splash.jpg'
                alt='Rentiful Rental Platform Hero Section'
                fill
                sizes="100vw"
                className='object-cover object-center'
                priority
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/40" />

            <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
                className='absolute top-1/2 -translate-y-1/2 text-center w-full px-4'
            >
                <div className="max-w-4xl mx-auto px-6 sm:px-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.4)]">
                        Start your journey to finding the perfect place to call home
                    </h1>
                    <p className="text-lg sm:text-xl text-white/90 mb-8 [text-shadow:_0_1px_8px_rgba(0,0,0,0.3)]">
                        Explore our wide range of properties tailored to fit your lifestyle and needs!
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center max-w-lg mx-auto rounded-xl sm:rounded-none shadow-lg sm:shadow-none transition-shadow duration-300 hover:shadow-xl">
                        <Input
                            type='text'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Search by city, neighborhood or address'
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch()
                            }}
                            className='w-full rounded-xl sm:rounded-none sm:rounded-l-xl border-none bg-white h-12 focus-visible:ring-2 focus-visible:ring-secondary-500'
                        />
                        <Button
                            onClick={handleSearch}
                            className="bg-secondary-500 text-white rounded-xl sm:rounded-none sm:rounded-r-xl border-none hover:bg-secondary-600 transition-colors duration-300 h-12 mt-2 sm:mt-0"
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </motion.div>

            <motion.button
                onClick={() => {
                    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition-colors duration-300 cursor-pointer"
                aria-label="Scroll to features section"
            >
                <ChevronDown size={28} />
            </motion.button>
        </div>
    )
}

export default HeroSection