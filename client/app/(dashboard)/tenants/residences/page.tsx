"use client";
import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetCurrentResidencesQuery, useGetTenantQuery, } from "@/state/api";
import { Home } from "lucide-react";

const Residences = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const { data: tenant } = useGetTenantQuery(
        authUser?.cognitoInfo?.id || "",
        {
            skip: !authUser?.cognitoInfo?.id,
        }
    );
    const {
        data: currentResidences,
        isLoading,
        error,
    } = useGetCurrentResidencesQuery(authUser?.cognitoInfo?.id || "", {
        skip: !authUser?.cognitoInfo?.id,
    });

    if (isLoading) {
        return (
            <div className="relative min-h-[400px]">
                <Loading />
            </div>
        );
    }
    if (error) return <div className="p-6 text-center text-gray-500">Error loading current residences</div>;

    return (
        <div className="dashboard-container">
            <Header
                title="Current Residences"
                subtitle="View and manage your current living spaces"
            />

            {currentResidences && currentResidences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentResidences.map((property) => (
                        <Card
                            key={property.id}
                            property={property}
                            isFavorite={
                                tenant?.favorites?.some((fav) => fav.id === property.id) || false
                            }
                            onFavoriteToggle={() => { }}
                            showFavoriteButton={false}
                            propertyLink={`/tenants/residences/${property.id}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Home className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                        You don&apos;t have any current residences yet.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Residences;