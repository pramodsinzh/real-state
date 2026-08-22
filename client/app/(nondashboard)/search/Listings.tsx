"use client"

import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import React from "react";
import CardCompact from "@/components/CardCompact";

const Listings = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.id || "",
    {
      skip: !authUser?.cognitoInfo?.id,
    }
  );
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser) return;
    const isFavorite = tenant?.favorites?.some(
      (fav) => fav.id === propertyId
    );
    if (isFavorite) {
      await removeFavorite({
        cognitoId: authUser.cognitoInfo.id,
        propertyId,
      });
    } else {
      await addFavorite({
        cognitoId: authUser.cognitoInfo.id,
        propertyId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full min-h-[280px]">
        <Loading />
      </div>
    );
  }
  if (isError || !properties) return <div className="p-4 text-sm text-gray-500">Failed to fetch properties</div>;

  return (
    <div className="w-full">
      <h3 className="flex items-center gap-2 text-sm px-4 py-3.5 sticky rounded-md top-0 bg-white z-10 border-b border-gray-100">
        <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-gray-900 text-white text-xs font-bold">
          {properties.length}
        </span>
        <span className="text-gray-700">
          Places in <span className="font-semibold text-gray-900">{filters.location}</span>
        </span>
      </h3>
      <div className="p-4">
        {properties?.map((property) =>
          viewMode === "grid" ? (
            <Card
              key={property.id}
              property={property}
              isFavorite={
                tenant?.favorites?.some(
                  (fav) => fav.id === property.id
                ) || false
              }
              onFavoriteToggle={() => handleFavoriteToggle(property.id)}
              showFavoriteButton={!!authUser}
              propertyLink={`/search/${property.id}`}
            />
          ) : (
            <CardCompact
              key={property.id}
              property={property}
              isFavorite={
                tenant?.favorites?.some(
                  (fav) => fav.id === property.id
                ) || false
              }
              onFavoriteToggle={() => handleFavoriteToggle(property.id)}
              showFavoriteButton={!!authUser}
              propertyLink={`/search/${property.id}`}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Listings;