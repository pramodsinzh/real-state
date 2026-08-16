import { Mail, MapPin, PhoneCall } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ApplicationCard = ({
  application,
  userType,
  children,
}: ApplicationCardProps) => {
  const [imgSrc, setImgSrc] = useState(
    application.property.photoUrls?.[0] || "/placeholder.jpg"
  );

  const statusColor =
    application.status === "Approved"
      ? "bg-green-500"
      : application.status === "Denied"
      ? "bg-red-500"
      : "bg-yellow-500";

  const contactPerson =
    userType === "manager" ? application.tenant : application.manager;

  const hasLease = !!application.lease;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white mb-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 md:px-4 py-6 gap-6 lg:gap-4">
        {/* Property Info Section */}
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
          <Image
            src={imgSrc}
            alt={application.property.name}
            width={200}
            height={150}
            className="rounded-xl object-cover w-full lg:w-[200px] h-[150px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold my-2 text-gray-900">
                {application.property.name}
              </h2>
              <div className="flex items-center mb-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                <span>{`${application.property.location.city}, ${application.property.location.country}`}</span>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              ${application.property.pricePerMonth}{" "}
              <span className="text-sm font-normal text-gray-500">/ month</span>
            </div>
          </div>
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-l border-gray-200 h-48" />

        {/* Status Section */}
        <div className="flex flex-col justify-between w-full lg:basis-2/12 lg:h-48 py-2 gap-3 lg:gap-0">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Status:</span>
              <span
                className={`px-2 py-1 ${statusColor} text-white rounded-full text-xs font-medium`}
              >
                {application.status}
              </span>
            </div>
            <div className="h-px bg-gray-100 mt-3" />
          </div>
          {hasLease ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Start Date:</span>{" "}
                <span className="font-medium text-gray-900">
                  {new Date(application.lease!.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">End Date:</span>{" "}
                <span className="font-medium text-gray-900">
                  {new Date(application.lease!.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Next Payment:</span>{" "}
                <span className="font-medium text-gray-900">
                  {new Date(application.lease!.nextPaymentDate).toLocaleDateString()}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">
              No lease yet
            </p>
          )}
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-l border-gray-200 h-48" />

        {/* Contact Person Section */}
        <div className="flex flex-col justify-start gap-5 w-full lg:basis-3/12 lg:h-48 py-2">
          <div>
            <div className="text-base font-semibold text-gray-900">
              {userType === "manager" ? "Tenant" : "Manager"}
            </div>
            <div className="h-px bg-gray-100 mt-3" />
          </div>
          <div className="flex gap-4">
            <div>
              <Image
                src="/landing-i1.png"
                alt={contactPerson.name}
                width={40}
                height={40}
                className="rounded-full mr-2 min-w-[40px] min-h-[40px] object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-gray-900">{contactPerson.name}</div>
              <div className="text-sm flex items-center text-gray-600">
                <PhoneCall className="w-4 h-4 mr-2 shrink-0" />
                {contactPerson.phoneNumber}
              </div>
              <div className="text-sm flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 shrink-0" />
                {contactPerson.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 my-4" />
      {children}
    </div>
  );
};

export default ApplicationCard;