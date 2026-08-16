"use client";
import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetApplicationsQuery, useGetAuthUserQuery } from "@/state/api";
import { CircleCheckBig, Clock, Download, XCircle } from "lucide-react"; 

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(undefined, {
    skip: !authUser?.cognitoInfo?.id,
  });

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

  return (
    <div className="dashboard-container">
      <Header
        title="Applications"
        subtitle="Track and manage your property rental applications"
      />
      <div className="w-full">
        {applications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-16">
            You haven&apos;t submitted any applications yet.
          </p>
        ) : (
          applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              userType="renter"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-5 w-full pb-4 px-4">
                {application.status === "Approved" ? (
                  <div className="bg-green-50 rounded-lg p-4 text-green-700 grow flex items-center text-sm">
                    <CircleCheckBig className="w-4 h-4 mr-2 shrink-0" />
                    {application.lease
                      ? `The property is being rented by you until ${new Date(
                          application.lease.endDate
                        ).toLocaleDateString()}`
                      : "Your application has been approved."}
                  </div>
                ) : application.status === "Pending" ? (
                  <div className="bg-yellow-50 rounded-lg p-4 text-yellow-700 grow flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 shrink-0" />
                    Your application is pending approval
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-lg p-4 text-red-700 grow flex items-center text-sm">
                    <XCircle className="w-4 h-4 mr-2 shrink-0" />
                    Your application has been denied
                  </div>
                )}
                {application.status === "Approved" && (
                  <button className="bg-white border border-gray-300 text-gray-700 text-sm py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 hover:bg-gray-900 hover:text-white hover:border-gray-900">
                    <Download className="w-4 h-4 mr-2" />
                    Download Agreement
                  </button>
                )}
              </div>
            </ApplicationCard>
          ))
        )}
      </div>
    </div>
  );
};

export default Applications;