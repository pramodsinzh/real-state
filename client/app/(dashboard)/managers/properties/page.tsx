"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import { Building } from "lucide-react"; 

const Properties = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: managerProperties,
    isLoading,
    error,
  } = useGetManagerPropertiesQuery(authUser?.cognitoInfo?.id || "", {
    skip: !authUser?.cognitoInfo?.id,
  });

  if (isLoading) {
    return (
      <div className="relative min-h-[400px]">
        <Loading />
      </div>
    );
  }
  if (error) return <div className="p-6 text-center text-gray-500">Error loading manager properties</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="My Properties"
        subtitle="View and manage your property listings"
      />

      {managerProperties && managerProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {managerProperties.map((property) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={false}
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/managers/properties/${property.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Building className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            You don&apos;t manage any properties yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Properties;