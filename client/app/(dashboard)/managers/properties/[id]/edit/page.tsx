"use client";

import PropertyFormFields from "@/components/PropertyFormFields";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    PropertyUpdateFormData,
    PropertyUpdateFormInput,
    propertyUpdateSchema,
} from "@/lib/schemas";
import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";
import {
    useDeletePropertyMutation,
    useGetAuthUserQuery,
    useGetPropertyQuery,
    useUpdatePropertyMutation,
} from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const EditProperty = () => {
    const { id } = useParams();
    const router = useRouter();
    const propertyId = Number(Array.isArray(id) ? id[0] : id);

    const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
    const { data: property, isLoading: propertyLoading } = useGetPropertyQuery(
        propertyId,
        { skip: !propertyId || isNaN(propertyId) }
    );
    const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
    const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const form = useForm<PropertyUpdateFormInput, any, PropertyUpdateFormData>({
        resolver: zodResolver(propertyUpdateSchema),
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

    useEffect(() => {
        if (!property) return;

        setExistingPhotos(property.photoUrls ?? []);
        form.reset({
            name: property.name,
            description: property.description,
            pricePerMonth: property.pricePerMonth,
            securityDeposit: property.securityDeposit,
            applicationFee: property.applicationFee,
            isPetsAllowed: property.isPetsAllowed,
            isParkingIncluded: property.isParkingIncluded,
            photoUrls: [],
            amenities: (property.amenities?.[0] as AmenityEnum) || AmenityEnum.WasherDryer,
            highlights: (property.highlights?.[0] as HighlightEnum) || HighlightEnum.HighSpeedInternetAccess,
            beds: property.beds,
            baths: Math.round(property.baths),
            squareFeet: property.squareFeet,
            propertyType: property.propertyType as PropertyTypeEnum,
            address: property.location.address,
            city: property.location.city,
            state: property.location.state,
            country: property.location.country,
            postalCode: property.location.postalCode,
        });
    }, [property, form]);

    const isOwner =
        authUser?.userRole === "manager" &&
        property?.managerCognitoId === authUser?.cognitoInfo?.id;

    const onSubmit = async (data: PropertyUpdateFormData) => {
        if (!isOwner) return;

        const newFiles = (data.photoUrls ?? []).filter((file) => file instanceof File);
        if (existingPhotos.length + newFiles.length === 0) {
            toast.error("Keep at least one photo, or upload a new one.");
            return;
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === "photoUrls") {
                newFiles.forEach((file) => formData.append("photos", file));
            } else if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        });
        formData.append("existingPhotoUrls", JSON.stringify(existingPhotos));

        const result = await updateProperty({ id: propertyId, body: formData });
        if ("data" in result) {
            router.push(`/managers/properties/${propertyId}`);
        }
    };

    const handleDelete = async () => {
        if (confirmText.trim().toLowerCase() !== "delete" || !isOwner) return;

        const result = await deleteProperty(propertyId);
        if ("data" in result) {
            router.push("/managers/properties");
        }
    };

    if (propertyLoading || authLoading) {
        return (
            <div className="relative min-h-[400px]">
                <Loading />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="dashboard-container">
                <p className="text-sm text-gray-500">Property not found.</p>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="dashboard-container">
                <p className="text-sm text-gray-500">
                    You can only edit properties you manage.
                </p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Link
                href={`/managers/properties/${propertyId}`}
                className="flex items-center mb-4 text-sm text-gray-600 transition-colors duration-300 hover:text-gray-900"
                scroll={false}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back to Property</span>
            </Link>

            <Header
                title={`Edit ${property.name}`}
                subtitle="Update listing details or remove this property"
            />

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="p-4 space-y-10"
                    >
                        <PropertyFormFields
                            photoLabel="Add more photos (optional)"
                            extraPhotosSlot={
                                existingPhotos.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                                        {existingPhotos.map((url) => (
                                            <div
                                                key={url}
                                                className="relative h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                                            >
                                                <Image
                                                    src={url}
                                                    alt="Property photo"
                                                    fill
                                                    className="object-cover"
                                                    sizes="160px"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExistingPhotos((photos) =>
                                                            photos.filter((photo) => photo !== url)
                                                        )
                                                    }
                                                    className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white rounded-full p-1 shadow-sm transition-colors duration-300"
                                                    aria-label="Remove photo"
                                                >
                                                    <X className="w-3.5 h-3.5 text-gray-700" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : null
                            }
                        />

                        <Button
                            type="submit"
                            disabled={isUpdating || isDeleting}
                            className="bg-gray-900 text-white hover:bg-secondary-500 transition-colors duration-300 rounded-full w-full mt-8"
                        >
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="bg-white rounded-xl border border-red-200 overflow-hidden mt-6">
                <div className="px-6 py-5 border-b border-red-100">
                    <h2 className="text-sm font-semibold text-red-700">Delete property</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Permanently remove this listing, including its leases and applications.
                    </p>
                </div>
                <div className="px-6 py-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDeleteOpen(true)}
                        disabled={isDeleting}
                        className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-300 rounded-full"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete this property
                    </Button>
                </div>
            </div>

            <Dialog
                open={isDeleteOpen}
                onOpenChange={(open) => {
                    setIsDeleteOpen(open);
                    if (!open) setConfirmText("");
                }}
            >
                <DialogContent className="bg-white rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete {property.name}?</DialogTitle>
                        <DialogDescription>
                            This cannot be undone. Related leases, payments, and applications
                            will also be removed. Type <span className="font-semibold">delete</span> to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder='Type "delete" to confirm'
                    />
                    <Button
                        type="button"
                        disabled={confirmText.trim().toLowerCase() !== "delete" || isDeleting}
                        onClick={handleDelete}
                        className="bg-red-600 text-white hover:bg-red-700 rounded-full"
                    >
                        {isDeleting ? "Deleting..." : "Delete property"}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditProperty;
