"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetPaymentsQuery, useGetPropertyLeasesQuery, useGetPropertyQuery } from "@/state/api";
import { ArrowDownToLine, ArrowLeft, Check, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const LeaseRow = ({ lease }: { lease: LeaseWithTenant }) => {
    const { data: payments } = useGetPaymentsQuery(lease.id);

    const currentDate = new Date();
    const currentMonthPayment = payments?.find(
        (payment) =>
            new Date(payment.dueDate).getMonth() === currentDate.getMonth() &&
            new Date(payment.dueDate).getFullYear() === currentDate.getFullYear()
    );
    const currentMonthStatus = currentMonthPayment?.paymentStatus || "Not Paid";

    return (
        <TableRow className="h-24">
            <TableCell>
                <div className="flex items-center space-x-3">
                    <Image
                        src="/landing-i1.png"
                        alt={lease.tenant.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                    />
                    <div>
                        <div className="font-semibold text-gray-900">
                            {lease.tenant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {lease.tenant.email}
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-sm">
                <div>{new Date(lease.startDate).toLocaleDateString()} -</div>
                <div>{new Date(lease.endDate).toLocaleDateString()}</div>
            </TableCell>
            <TableCell className="font-medium text-gray-900">
                ${lease.rent.toFixed(2)}
            </TableCell>
            <TableCell>
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${currentMonthStatus === "Paid"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                        }`}
                >
                    {currentMonthStatus === "Paid" && (
                        <Check className="w-3.5 h-3.5 inline-block mr-1" />
                    )}
                    {currentMonthStatus}
                </span>
            </TableCell>
            <TableCell className="text-sm text-gray-600">
                {lease.tenant.phoneNumber}
            </TableCell>
            <TableCell>
                <button className="border border-gray-300 text-gray-700 text-sm py-1.5 px-3 rounded-md flex items-center justify-center font-medium transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                    <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" />
                    Download Agreement
                </button>
            </TableCell>
        </TableRow>
    );
};

const PropertyTenants = () => {
    const { id } = useParams();
    const propertyId = Number(Array.isArray(id) ? id[0] : id);

    const { data: property, isLoading: propertyLoading } = useGetPropertyQuery(
        propertyId,
        { skip: !propertyId || isNaN(propertyId) }
    );
    const { data: leases, isLoading: leasesLoading } = useGetPropertyLeasesQuery(
        propertyId,
        { skip: !propertyId || isNaN(propertyId) }
    );

    if (propertyLoading || leasesLoading) {
        return (
            <div className="relative min-h-[400px]">
                <Loading />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Back to properties page */}
            <Link
                href="/managers/properties"
                className="flex items-center mb-4 text-sm text-gray-600 transition-colors duration-300 hover:text-gray-900"
                scroll={false}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back to Properties</span>
            </Link>

            <Header
                title={property?.name || "My Property"}
                subtitle="Manage tenants and leases for this property"
            />

            <div className="w-full space-y-6">
                <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-gray-900">Tenants Overview</h2>
                            <p className="text-sm text-gray-500">
                                Manage and view all tenants for this property.
                            </p>
                        </div>
                        <button className="bg-white border border-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                            <Download className="w-4 h-4 mr-2" />
                            <span>Download All</span>
                        </button>
                    </div>
                    <div className="h-px bg-gray-100 mt-4 mb-1" />

                    {leases && leases.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Lease Period</TableHead>
                                        <TableHead>Monthly Rent</TableHead>
                                        <TableHead>Current Month Status</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leases.map((lease) => (
                                        <LeaseRow key={lease.id} lease={lease} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">
                            No tenants for this property yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyTenants;