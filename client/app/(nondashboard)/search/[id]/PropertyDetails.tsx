import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmenityIcons, HighlightIcons } from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import { useGetPropertyQuery } from "@/state/api";
import Loading from "@/components/Loading";
import { HelpCircle, PawPrint, Car } from "lucide-react";
import React from "react";

const PropertyDetails = ({ propertyId }: PropertyDetailsProps) => {
    const {
        data: property,
        isError,
        isLoading,
    } = useGetPropertyQuery(propertyId);

    if (isLoading) {
        return (
            <div className="relative w-full min-h-[200px]">
                <Loading />
            </div>
        );
    }
    if (isError || !property) {
        return <>Property not Found</>;
    }

    return (
        <div className="mb-6">
            {/* Amenities */}
            <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Property Amenities</h2>
                {property.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {property.amenities.map((amenity) => {
                            const Icon = AmenityIcons[amenity as unknown as AmenityEnum] || HelpCircle;
                            return (
                                <div
                                    key={amenity}
                                    className="flex flex-col items-center border border-gray-200 rounded-xl py-6 px-4 transition-colors duration-300 hover:border-gray-400"
                                >
                                    <Icon className="w-6 h-6 mb-2 text-gray-700" />
                                    <span className="text-xs text-center text-gray-700">
                                        {formatEnumString(amenity)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No amenities listed.</p>
                )}
            </div>

            {/* Highlights */}
            <div className="mt-10 mb-12">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Highlights</h2>
                {property.highlights.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {property.highlights.map((highlight) => {
                            const Icon = HighlightIcons[highlight as unknown as HighlightEnum] || HelpCircle;
                            return (
                                <div
                                    key={highlight}
                                    className="flex flex-col items-center border border-gray-200 rounded-xl py-6 px-4 transition-colors duration-300 hover:border-gray-400"
                                >
                                    <Icon className="w-6 h-6 mb-2 text-secondary-500" />
                                    <span className="text-xs text-center text-gray-700">
                                        {formatEnumString(highlight)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No highlights listed.</p>
                )}
            </div>

            {/* Tabs Section */}
            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                    Fees and Policies
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    The fees below are based on community-supplied data and may exclude
                    additional fees and utilities.
                </p>
                <Tabs defaultValue="required-fees">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="required-fees">Required Fees</TabsTrigger>
                        <TabsTrigger value="pets">Pets</TabsTrigger>
                        <TabsTrigger value="parking">Parking</TabsTrigger>
                    </TabsList>

                    <TabsContent value="required-fees" className="max-w-md">
                        <p className="font-semibold text-gray-900 mt-5 mb-2">
                            One time move in fees
                        </p>
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <div className="flex justify-between px-4 py-2.5 bg-gray-50">
                                <span className="text-gray-700 text-sm font-medium">
                                    Application Fee
                                </span>
                                <span className="text-gray-900 text-sm font-semibold">
                                    ${property.applicationFee}
                                </span>
                            </div>
                            <div className="h-px bg-gray-200" />
                            <div className="flex justify-between px-4 py-2.5 bg-gray-50">
                                <span className="text-gray-700 text-sm font-medium">
                                    Security Deposit
                                </span>
                                <span className="text-gray-900 text-sm font-semibold">
                                    ${property.securityDeposit}
                                </span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="pets">
                        <div className="flex items-center gap-2 mt-5 rounded-lg border border-gray-200 px-4 py-3 max-w-md">
                            <PawPrint className={`w-4 h-4 ${property.isPetsAllowed ? "text-secondary-500" : "text-gray-400"}`} />
                            <p className="text-sm font-medium text-gray-900">
                                Pets are {property.isPetsAllowed ? "allowed" : "not allowed"}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="parking">
                        <div className="flex items-center gap-2 mt-5 rounded-lg border border-gray-200 px-4 py-3 max-w-md">
                            <Car className={`w-4 h-4 ${property.isParkingIncluded ? "text-secondary-500" : "text-gray-400"}`} />
                            <p className="text-sm font-medium text-gray-900">
                                Parking is{" "}
                                {property.isParkingIncluded ? "included" : "not included"}
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default PropertyDetails;