"use client"; 

import dynamic from "next/dynamic";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface MapViewProps {
  properties: PropertyWithLocation[];
  center: [number, number];
}

const MapView = dynamic<MapViewProps>(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-gray-100 flex flex-col items-center justify-center gap-3 border border-gray-200">
      <LoadingSpinner size={24} />
      <span className="text-sm text-gray-500">Loading map...</span>
    </div>
  ),
});

const Map = () => {
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-xl bg-gray-100 flex flex-col items-center justify-center gap-3 border border-gray-200">
        <LoadingSpinner size={24} />
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    );
  }

  if (isError || !properties) {
    return (
      <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 text-sm text-gray-500">
        Failed to load map
      </div>
    );
  }

  return (
    <MapView
      properties={properties}
      center={filters.coordinates || [-74.5, 40]}
    />
  );
};

export default Map;
