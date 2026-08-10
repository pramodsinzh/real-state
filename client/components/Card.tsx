"use client"

import { Bath, Bed, Heart, House, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Card = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: CardProps) => {
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.jpg"
  );

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 w-full mb-5">
      <div className="relative">
        <div className="w-full h-48 relative bg-gray-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {property.isPetsAllowed && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-2.5 py-1 rounded-full">
              Pets Allowed
            </span>
          )}
          {property.isParkingIncluded && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-2.5 py-1 rounded-full">
              Parking Included
            </span>
          )}
        </div>

        {showFavoriteButton && (
          <button
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 cursor-pointer transition-colors duration-300 shadow-sm"
            onClick={onFavoriteToggle}
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-300 ${
                isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
              }`}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-lg font-bold text-gray-900 leading-snug">
            {propertyLink ? (
              <Link
                href={propertyLink}
                className="transition-colors duration-300 hover:text-secondary-500"
                scroll={false}
              >
                {property.name}
              </Link>
            ) : (
              property.name
            )}
          </h2>
          <p className="shrink-0 text-lg font-bold text-gray-900">
            ${property.pricePerMonth.toFixed(0)}
            <span className="text-gray-500 text-sm font-normal">/mo</span>
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          {property?.location?.address}, {property?.location?.city}
        </p>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold text-gray-900">
            {(property.averageRating ?? 0).toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({property.numberOfReviews ?? 0} Reviews)
          </span>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="flex items-center justify-between gap-4 text-gray-600 mt-4 text-sm">
          <span className="flex items-center gap-1.5">
            <Bed className="w-4 h-4" />
            {property.beds} Bed
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            {property.baths} Bath
          </span>
          <span className="flex items-center gap-1.5">
            <House className="w-4 h-4" />
            {property.squareFeet} sq ft
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;