"use client";

import { useGetPropertyQuery } from "@/state/api";
import Loading from "@/components/Loading";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Compass, MapPin } from "lucide-react";
import dynamic from "next/dynamic"; 

interface LocationMapViewProps {
    latitude: number;
    longitude: number;
}

const LocationMapView = dynamic<LocationMapViewProps>(
    () => import("./LocationMapView"),
    {
        ssr: false,
        loading: () => (
            <div className="mt-4 h-[300px] rounded-lg bg-gray-100 flex flex-col items-center justify-center gap-3">
                <LoadingSpinner size={24} />
                <span className="text-sm text-gray-500">Loading map...</span>
            </div>
        ),
    }
);

const PropertyLocation = ({ propertyId }: PropertyDetailsProps) => {
    const {
        data: property,
        isError,
        isLoading,
    } = useGetPropertyQuery(propertyId);

    if (isLoading) {
        return (
            <div className="relative w-full min-h-[200px] py-16">
                <Loading />
            </div>
        );
    }
    if (isError || !property) {
        return <>Property not Found</>;
    }

    return (
        <div className="py-16">
            <h2 className="text-xl font-semibold text-gray-900">
                Map and Location
            </h2>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm mt-3 gap-2">
                <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0" />
                    Property Address:
                    <span className="ml-2 font-medium text-gray-900">
                        {property.location?.address || "Address not available"}
                    </span>
                </div>
                <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                        property.location?.address || ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:underline text-secondary-500 font-medium transition-colors duration-300 hover:text-gray-900"
                >
                    <Compass className="w-4 h-4" />
                    Get Directions
                </a>
            </div>

            <div className="relative mt-4 h-[300px] rounded-xl overflow-hidden border border-gray-200">
                <LocationMapView
                    latitude={property.location.coordinates.latitude}
                    longitude={property.location.coordinates.longitude}
                />
            </div>
        </div>
    );
};

export default PropertyLocation;