"use client"

import { Bath, Bed, Heart, House, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const CardCompact = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: CardCompactProps) => {
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.jpg"
  );

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 w-full flex h-40 mb-5">
      <div className="relative w-1/3 shrink-0 bg-gray-100 overflow-hidden">
        <Image
          src={imgSrc}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 flex gap-1 flex-col">
          {property.isPetsAllowed && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-2 py-0.5 rounded-full w-fit">
              Pets
            </span>
          )}
          {property.isParkingIncluded && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-2 py-0.5 rounded-full w-fit">
              Parking
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h2 className="text-base font-bold text-gray-900 leading-snug truncate">
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
            {showFavoriteButton && (
              <button
                className="shrink-0 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors duration-300"
                onClick={onFavoriteToggle}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors duration-300 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-gray-500"
                  }`}
                />
              </button>
            )}
          </div>
          <p className="text-gray-500 mb-1.5 text-xs truncate">
            {property?.location?.address}, {property?.location?.city}
          </p>
          <div className="flex text-xs items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-gray-900">
              {(property.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({property.numberOfReviews ?? 0})
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex gap-2.5 text-gray-600">
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              {property.beds}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              {property.baths}
            </span>
            <span className="flex items-center gap-1">
              <House className="w-3.5 h-3.5" />
              {property.squareFeet}
            </span>
          </div>

          <p className="text-sm font-bold text-gray-900">
            ${property.pricePerMonth.toFixed(0)}
            <span className="text-gray-500 text-xs font-normal">/mo</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardCompact;