"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetPropertiesQuery, useGetTenantQuery, useRemoveFavoritePropertyMutation, } from "@/state/api";
import { Heart } from "lucide-react";

const Favorites = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.id || "",
    {
      skip: !authUser?.cognitoInfo?.id,
    }
  );
  const [removeFavorite] = useRemoveFavoritePropertyMutation();

  const {
    data: favoriteProperties,
    isLoading,
    error,
  } = useGetPropertiesQuery(
    { favoriteIds: tenant?.favorites?.map((fav) => fav.id) },
    { skip: !tenant?.favorites || tenant?.favorites.length === 0 }
  );

  const handleRemoveFavorite = (propertyId: number) => {
    if (!authUser?.cognitoInfo?.id) return;
    removeFavorite({
      cognitoId: authUser.cognitoInfo.id,
      propertyId,
    });
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="p-6 text-center text-gray-500">Error loading favorites</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="Favorited Properties"
        subtitle="Browse and manage your saved property listings"
      />

      {favoriteProperties && favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProperties.map((property) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={true}
              onFavoriteToggle={() => handleRemoveFavorite(property.id)}
              showFavoriteButton={true}
              propertyLink={`/tenants/residences/${property.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Heart className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            You don&apos;t have any favorited properties yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites;