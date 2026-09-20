import { CustomFormField } from "@/components/FormField";
import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";
import { ReactNode } from "react";

const PropertyFormFields = ({
  extraPhotosSlot,
  photoLabel = "Property Photos",
}: {
  extraPhotosSlot?: ReactNode;
  photoLabel?: string;
}) => {
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h2>
        <div className="space-y-4">
          <CustomFormField name="name" label="Property Name" />
          <CustomFormField
            name="description"
            label="Description"
            type="textarea"
          />
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="space-y-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Fees</h2>
        <CustomFormField
          name="pricePerMonth"
          label="Price per Month"
          type="number"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            name="securityDeposit"
            label="Security Deposit"
            type="number"
          />
          <CustomFormField
            name="applicationFee"
            label="Application Fee"
            type="number"
          />
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="space-y-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomFormField
            name="beds"
            label="Number of Beds"
            type="number"
          />
          <CustomFormField
            name="baths"
            label="Number of Baths"
            type="number"
          />
          <CustomFormField
            name="squareFeet"
            label="Square Feet"
            type="number"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CustomFormField
            name="isPetsAllowed"
            label="Pets Allowed"
            type="switch"
          />
          <CustomFormField
            name="isParkingIncluded"
            label="Parking Included"
            type="switch"
          />
        </div>
        <div className="mt-4">
          <CustomFormField
            name="propertyType"
            label="Property Type"
            type="select"
            options={Object.keys(PropertyTypeEnum).map((type) => ({
              value: type,
              label: type,
            }))}
          />
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Amenities and Highlights
        </h2>
        <div className="space-y-6">
          <CustomFormField
            name="amenities"
            label="Amenities"
            type="select"
            options={Object.keys(AmenityEnum).map((amenity) => ({
              value: amenity,
              label: amenity,
            }))}
          />
          <CustomFormField
            name="highlights"
            label="Highlights"
            type="select"
            options={Object.keys(HighlightEnum).map((highlight) => ({
              value: highlight,
              label: highlight,
            }))}
          />
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Photos</h2>
        {extraPhotosSlot}
        <CustomFormField
          name="photoUrls"
          label={photoLabel}
          type="file"
          accept="image/*"
        />
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="space-y-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Additional Information
        </h2>
        <CustomFormField name="address" label="Address" />
        <div className="flex justify-between gap-4">
          <CustomFormField name="city" label="City" className="w-full" />
          <CustomFormField
            name="state"
            label="State"
            className="w-full"
          />
          <CustomFormField
            name="postalCode"
            label="Postal Code"
            className="w-full"
          />
        </div>
        <CustomFormField name="country" label="Country" />
      </div>
    </>
  );
};

export default PropertyFormFields;
