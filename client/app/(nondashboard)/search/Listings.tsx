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

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="w-full">
      <h3 className="text-sm px-4 py-3 font-bold sticky top-0 bg-white z-10 border-b border-gray-100">
        {properties.length}{" "}
        <span className="text-gray-700 font-normal">
          Places in {filters.location}
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