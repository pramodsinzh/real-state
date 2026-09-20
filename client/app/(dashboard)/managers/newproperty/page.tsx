"use client";

import PropertyFormFields from "@/components/PropertyFormFields";
import Header from "@/components/Header";
import { Form } from "@/components/ui/form";
import { PropertyFormData, PropertyFormInput, propertySchema } from "@/lib/schemas";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";
import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const NewProperty = () => {
    const [createProperty, { isLoading }] = useCreatePropertyMutation();
    const { data: authUser } = useGetAuthUserQuery();
    const router = useRouter();

    const form = useForm<PropertyFormInput, any, PropertyFormData>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            name: "",
            description: "",
            pricePerMonth: 1000,
            securityDeposit: 500,
            applicationFee: 100,
            isPetsAllowed: true,
            isParkingIncluded: true,
            photoUrls: [],
            amenities: AmenityEnum.WasherDryer,
            highlights: HighlightEnum.HighSpeedInternetAccess,
            beds: 1,
            baths: 1,
            squareFeet: 1000,
            propertyType: PropertyTypeEnum.Apartment,
            address: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
        },
    });

    const onSubmit = async (data: PropertyFormData) => {
        if (!authUser?.cognitoInfo?.id) {
            console.error("No manager ID found");
            return;
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === "photoUrls") {
                const files = value as File[];
                files.forEach((file: File) => {
                    formData.append("photos", file);
                });
            } else if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        });

        formData.append("managerCognitoId", authUser.cognitoInfo.id);

        const result = await createProperty(formData);

        if ("data" in result) {
            router.push("/managers/properties");
        }
    };

    return (
        <div className="dashboard-container">
            <Header
                title="Add New Property"
                subtitle="Create a new property listing with detailed information"
            />
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="p-4 space-y-10"
                    >
                        <PropertyFormFields />

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gray-900 text-white hover:bg-secondary-500 transition-colors duration-300 rounded-full w-full mt-8"
                        >
                            {isLoading ? "Creating..." : "Create Property"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default NewProperty;
