"use client";

import Loading from "@/components/Loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetAuthUserQuery, useGetLeasesQuery, useGetPaymentsQuery, useGetPropertyQuery } from "@/state/api";
import { Lease, Payment } from "@/types/prismaTypes";
import Image from "next/image";
import { ArrowDownToLineIcon, Check, CreditCard, Download, Edit, FileText, Mail, MapPin, User } from "lucide-react";
import { useParams } from "next/navigation";

const PaymentMethod = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 mt-10 md:mt-0 flex-1">
            <h2 className="text-xl font-bold mb-1 text-gray-900">Payment method</h2>
            <p className="text-sm text-gray-500 mb-4">Change how you pay for your plan.</p>
            <div className="border border-gray-200 rounded-lg p-6">
                <div>
                    {/* Card Info */}
                    <div className="flex gap-6 sm:gap-10">
                        <div className="w-28 h-16 sm:w-36 sm:h-20 bg-gray-900 flex items-center justify-center rounded-md shrink-0">
                            <span className="text-white text-lg sm:text-2xl font-bold">VISA</span>
                        </div>
                        <div className="flex flex-col justify-between min-w-0">
                            <div>
                                <div className="flex flex-wrap items-start gap-2 sm:gap-5">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                        Visa ending in 2024
                                    </h3>
                                    <span className="text-xs font-medium border border-secondary-500 text-secondary-500 px-2.5 py-0.5 rounded-full">
                                        Default
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                    <CreditCard className="w-4 h-4 mr-1.5 shrink-0" />
                                    <span>Expiry • 26/06/2024</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-2">
                                <Mail className="w-4 h-4 mr-1.5 shrink-0" />
                                <span>billing@baseclub.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-4" />
                    <div className="flex justify-end">
                        <button className="bg-white border border-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                            <Edit className="w-4 h-4 mr-2" />
                            <span>Edit</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResidenceCard = ({
    property,
    currentLease,
}: {
    property: PropertyWithLocation;
    currentLease: Lease;
}) => {
    const imageSrc = property.photoUrls?.[0] || "/placeholder.jpg";

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 flex-1 flex flex-col justify-between">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative w-full sm:w-64 h-40 sm:h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image
                        src={imageSrc}
                        alt={property.name}
                        fill
                        className="object-cover"
                        sizes="256px"
                    />
                </div>

                <div className="flex flex-col justify-between min-w-0">
                    <div>
                        <div className="bg-green-500 w-fit text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Active Lease
                        </div>

                        <h2 className="text-xl font-bold my-2 text-gray-900 truncate">
                            {property.name}
                        </h2>
                        <div className="flex items-center mb-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                            <span>
                                {property.location.city}, {property.location.country}
                            </span>
                        </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                        ${currentLease.rent}{" "}
                        <span className="text-gray-500 text-sm font-normal">/ month</span>
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div>
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex flex-wrap justify-between items-center gap-3 text-sm">
                    <div className="xl:flex">
                        <div className="text-gray-500 mr-2">Start Date: </div>
                        <div className="font-semibold text-gray-900">
                            {new Date(currentLease.startDate).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="hidden sm:block border-l border-gray-200 h-4" />
                    <div className="xl:flex">
                        <div className="text-gray-500 mr-2">End Date: </div>
                        <div className="font-semibold text-gray-900">
                            {new Date(currentLease.endDate).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="hidden sm:block border-l border-gray-200 h-4" />
                    <div className="xl:flex">
                        <div className="text-gray-500 mr-2">Next Payment: </div>
                        <div className="font-semibold text-gray-900">
                            {new Date(currentLease.endDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div className="h-px bg-gray-100 my-4" />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-end gap-2 w-full">
                <button className="bg-white border border-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                    <User className="w-4 h-4 mr-2" />
                    Manager
                </button>
                <button className="bg-white border border-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                    <Download className="w-4 h-4 mr-2" />
                    Download Agreement
                </button>
            </div>
        </div>
    );
};

const BillingHistory = ({ payments }: { payments: Payment[] }) => {
    return (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                    <h2 className="text-xl font-bold mb-1 text-gray-900">Billing History</h2>
                    <p className="text-sm text-gray-500">
                        Download your previous plan receipts and usage details.
                    </p>
                </div>
                <div>
                    <button className="bg-white border border-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                        <Download className="w-4 h-4 mr-2" />
                        <span>Download All</span>
                    </button>
                </div>
            </div>
            <div className="h-px bg-gray-100 mt-4 mb-1" />

            {payments.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Billing Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id} className="h-16">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <FileText className="w-4 h-4 mr-2 shrink-0 text-gray-400" />
                                            Invoice #{payment.id} -{" "}
                                            {new Date(payment.paymentDate).toLocaleString("default", {
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold border ${payment.paymentStatus === "Paid"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                }`}
                                        >
                                            {payment.paymentStatus === "Paid" ? (
                                                <Check className="w-3.5 h-3.5 inline-block mr-1" />
                                            ) : null}
                                            {payment.paymentStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>${payment.amountPaid.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <button className="border border-gray-300 text-gray-700 text-sm py-1.5 px-3 rounded-md flex items-center justify-center font-medium transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                                            <ArrowDownToLineIcon className="w-3.5 h-3.5 mr-1.5" />
                                            Download
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-sm text-gray-500 text-center py-10">
                    No billing history yet.
                </p>
            )}
        </div>
    );
};

const Residence = () => {
    const { id } = useParams();
    const propertyId = Number(Array.isArray(id) ? id[0] : id);
    const { data: authUser } = useGetAuthUserQuery();

    const {
        data: property,
        isLoading: propertyLoading,
        error: propertyError,
    } = useGetPropertyQuery(propertyId, {
        skip: !propertyId || isNaN(propertyId),
    });

    const { data: leases, isLoading: leasesLoading } = useGetLeasesQuery(undefined, {
        skip: !authUser,
    });

    const { data: payments, isLoading: paymentsLoading } = useGetPaymentsQuery(
        leases?.[0]?.id || 0,
        { skip: !leases?.[0]?.id }
    );

    if (propertyLoading || leasesLoading || paymentsLoading) {
        return (
            <div className="relative min-h-[400px]">
                <Loading />
            </div>
        );
    }
    if (!property || propertyError) {
        return <div className="p-6 text-center text-gray-500">Error loading property</div>;
    }

    const currentLease = leases?.find(
        (lease) => lease.propertyId === property.id
    );

    return (
        <div className="dashboard-container">
            <div className="w-full mx-auto">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                    {currentLease && (
                        <ResidenceCard property={property} currentLease={currentLease} />
                    )}
                    <PaymentMethod />
                </div>
                <BillingHistory payments={payments || []} />
            </div>
        </div>
    );
};

export default Residence;