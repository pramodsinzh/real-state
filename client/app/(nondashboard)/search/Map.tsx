"use client"; 

import dynamic from "next/dynamic";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api"; 

interface MapViewProps {
  properties: PropertyWithLocation[];
  center: [number, number];
}

const MapView = dynamic<MapViewProps>(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-full md:basis-5/12 md:grow rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
      Loading map...
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

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <MapView
      properties={properties}
      center={filters.coordinates || [-74.5, 40]}
    />
  );
};

export default Map;