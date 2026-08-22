'use client'

import Image from 'next/image'
import { motion } from "framer-motion"
import Link from 'next/link'

const CallToActionSection = () => {
    return (
        <div className='relative py-24'>
            <Image
                src='/landing-call-to-action.jpg'
                alt='Rentiful search section background'
                fill
                sizes="100vw"
                className='object-cover object-center'
            />
            <div className="absolute inset-0 bg-black/60" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className='relative max-w-4xl xl:max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-12'
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left max-w-xl">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">
                            Find Your Dream Rental Property
                        </h2>
                        <p className="text-white/90 mt-3">
                            Discover a wide range of rental properties in your desired locations.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                        <Link
                            href='/search'
                            scroll={false}
                            className='text-center text-primary-700 bg-white border border-white rounded-lg px-6 py-3 font-semibold transition-colors duration-300 hover:bg-transparent hover:text-white'
                        >
                            Search
                        </Link>
                        <Link
                            href='/signup'
                            scroll={false}
                            className='text-center text-white bg-secondary-500 border border-secondary-500 rounded-lg py-3 px-6 font-semibold transition-colors duration-300 hover:bg-transparent hover:text-secondary-500'
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default CallToActionSection