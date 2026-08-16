"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetApplicationsQuery, useGetAuthUserQuery, useUpdateApplicationStatusMutation } from "@/state/api";
import { CircleCheckBig, Download, File, Hospital } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Applications = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const [activeTab, setActiveTab] = useState("all");

    const {
        data: applications,
        isLoading,
        isError,
    } = useGetApplicationsQuery(undefined, {
        skip: !authUser?.cognitoInfo?.id,
    });
    const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

    const handleStatusChange = async (
        id: number,
        status: "Approved" | "Denied"
    ) => {
        await updateApplicationStatus({ id, status });
    };

    if (isLoading) {
        return (
            <div className="relative min-h-[400px]">
                <Loading />
            </div>
        );
    }
    if (isError || !applications) {
        return <div className="p-6 text-center text-gray-500">Error fetching applications</div>;
    }

    const filteredApplications = applications?.filter((application) => {
        if (activeTab === "all") return true;
        return application.status.toLowerCase() === activeTab;
    });

    return (
        <div className="dashboard-container">
            <Header
                title="Applications"
                subtitle="View and manage applications for your properties"
            />
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full my-5"
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="denied">Denied</TabsTrigger>
                </TabsList>
                {["all", "pending", "approved", "denied"].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-5 w-full">
                        {filteredApplications.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-16">
                                No applications here.
                            </p>
                        ) : (
                            filteredApplications
                                .filter(
                                    (application) =>
                                        tab === "all" || application.status.toLowerCase() === tab
                                )
                                .map((application) => (
                                    <ApplicationCard
                                        key={application.id}
                                        application={application}
                                        userType="manager"
                                    >
                                        <div className="flex flex-col lg:flex-row justify-between gap-5 w-full pb-4 px-4">
                                            {/* Colored Section Status */}
                                            <div
                                                className={`p-4 rounded-lg grow ${application.status === "Approved"
                                                        ? "bg-green-50"
                                                        : application.status === "Denied"
                                                            ? "bg-red-50"
                                                            : "bg-yellow-50"
                                                    }`}
                                            >
                                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                                    <File className="w-4 h-4 shrink-0 text-gray-500" />
                                                    <span className="text-gray-700">
                                                        Application submitted on{" "}
                                                        {new Date(
                                                            application.applicationDate
                                                        ).toLocaleDateString()}
                                                        .
                                                    </span>
                                                    <CircleCheckBig className="w-4 h-4 shrink-0 text-gray-500" />
                                                    <span
                                                        className={`font-semibold ${application.status === "Approved"
                                                                ? "text-green-700"
                                                                : application.status === "Denied"
                                                                    ? "text-red-700"
                                                                    : "text-yellow-700"
                                                            }`}
                                                    >
                                                        {application.status === "Approved" &&
                                                            "This application has been approved."}
                                                        {application.status === "Denied" &&
                                                            "This application has been denied."}
                                                        {application.status === "Pending" &&
                                                            "This application is pending review."}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    href={`/managers/properties/${application.property.id}`}
                                                    className="bg-white border border-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900"
                                                    scroll={false}
                                                >
                                                    <Hospital className="w-4 h-4 mr-2" />
                                                    Property Details
                                                </Link>
                                                {application.status === "Approved" && (
                                                    <button className="bg-white border border-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download Agreement
                                                    </button>
                                                )}
                                                {application.status === "Pending" && (
                                                    <>
                                                        <button
                                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md transition-colors duration-300 hover:bg-green-700"
                                                            onClick={() =>
                                                                handleStatusChange(application.id, "Approved")
                                                            }
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md transition-colors duration-300 hover:bg-red-700"
                                                            onClick={() =>
                                                                handleStatusChange(application.id, "Denied")
                                                            }
                                                        >
                                                            Deny
                                                        </button>
                                                    </>
                                                )}
                                                {application.status === "Denied" && (
                                                    <button className="bg-gray-900 text-white text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-secondary-500">
                                                        Contact User
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </ApplicationCard>
                                ))
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default Applications;