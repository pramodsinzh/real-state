"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

const DiscoverSection = () => {
    return (
        <motion.div
            id="discover-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className='py-12 mb-16 bg-white'
        >
            <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
                <motion.div
                    variants={itemVariants}
                    className='my-12 text-center'
                >
                    <h2 className="text-3xl font-semibold leading-tight text-gray-800">
                        Discover
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Find Your Dream Rental Property Today!
                    </p>
                    <p className="mt-2 text-gray-500 max-w-3xl mx-auto">
                        Searching for your dream rental property has never been easier. With our user-friendly search feature, you can quickly find the perfect home that meets all your needs. Start your search today and discover your dream property!
                    </p>
                </motion.div>
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 text-center">
                    {[
                        {
                            imageSrc: "/landing-icon-wand.png",
                            title: "Search for Properties",
                            description: "Browse through our extensive collection of rental properties in your desired location."
                        },
                        {
                            imageSrc: "/landing-icon-calendar.png",
                            title: "Book Your Rental",
                            description: "Once you've found the perfect property, easily book it online with just a few clicks."
                        },
                        {
                            imageSrc: "/landing-icon-heart.png",
                            title: "Enjoy your New Home",
                            description: "Move into your new rental property and start enjoying your dream home."
                        },
                    ].map((card, index) => (
                        <motion.div key={index} variants={itemVariants} className="relative">
                            <DiscoverCard {...card} step={index + 1} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

const DiscoverCard = ({
    imageSrc,
    title,
    description,
    step,
}: {
    imageSrc: string
    title: string
    description: string
    step: number
}) => (
    <div className="relative px-6 py-12 shadow-md hover:shadow-xl rounded-xl bg-primary-50 md:h-72 transition-shadow duration-300 flex flex-col items-center">
        <span className="absolute top-4 right-5 text-4xl font-bold text-primary-200 select-none">
            0{step}
        </span>
        <div className="bg-primary-700 rounded-full mb-5 h-16 w-16 aspect-square shrink-0 overflow-hidden flex items-center justify-center mx-auto transition-transform duration-300 hover:scale-110 shadow-sm">
            <Image
                src={imageSrc}
                width={30}
                height={30}
                className='w-7 h-7 object-contain brightness-0 invert'
                alt={title}
            />
        </div>
        <h3 className="mt-2 text-xl font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-500 text-base leading-relaxed">{description}</p>
    </div>
)

export default DiscoverSection