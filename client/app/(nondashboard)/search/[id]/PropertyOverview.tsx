import { useGetPropertyQuery } from "@/state/api";
import { MapPin, Star, ShieldCheck } from "lucide-react";
import React from "react";

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) return <>Loading...</>;
  if (isError || !property) {
    return <>Property not Found</>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-1">
          {property.location?.country} / {property.location?.state} /{" "}
          <span className="font-semibold text-gray-600">
            {property.location?.city}
          </span>
        </div>
        <h1 className="text-3xl font-bold my-4 text-gray-900">{property.name}</h1>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
            {property.location?.city}, {property.location?.state},{" "}
            {property.location?.country}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center text-sm">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">
                {(property.averageRating ?? 0).toFixed(1)}
              </span>
              <span className="text-gray-500 ml-1">
                ({property.numberOfReviews ?? 0} Reviews)
              </span>
            </span>
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified Listing
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="border border-gray-200 rounded-xl p-5 mb-8 bg-gray-50/50">
        <div className="flex flex-wrap justify-between items-center gap-y-4">
          <div className="flex-1 min-w-[100px]">
            <div className="text-xs text-gray-500 mb-0.5">Monthly Rent</div>
            <div className="font-semibold text-gray-900">
              ${property.pricePerMonth.toLocaleString()}
            </div>
          </div>
          <div className="hidden sm:block border-l border-gray-200 h-10"></div>
          <div className="flex-1 min-w-[100px]">
            <div className="text-xs text-gray-500 mb-0.5">Bedrooms</div>
            <div className="font-semibold text-gray-900">{property.beds} bd</div>
          </div>
          <div className="hidden sm:block border-l border-gray-200 h-10"></div>
          <div className="flex-1 min-w-[100px]">
            <div className="text-xs text-gray-500 mb-0.5">Bathrooms</div>
            <div className="font-semibold text-gray-900">{property.baths} ba</div>
          </div>
          <div className="hidden sm:block border-l border-gray-200 h-10"></div>
          <div className="flex-1 min-w-[100px]">
            <div className="text-xs text-gray-500 mb-0.5">Square Feet</div>
            <div className="font-semibold text-gray-900">
              {property.squareFeet.toLocaleString()} sq ft
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">About {property.name}</h2>
        <p className="text-gray-600 leading-7 whitespace-pre-line">
          {property.description || "No description available for this property."}
        </p>
      </div>
    </div>
  );
};

export default PropertyOverview;