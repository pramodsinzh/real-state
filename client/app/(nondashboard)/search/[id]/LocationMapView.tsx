"use client";

import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="27" height="41" viewBox="0 0 27 41">
  <g fill-rule="nonzero">
    <g fill="#000000">
      <path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"/>
    </g>
    <g transform="translate(8.0, 8.0)">
      <circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.5"/>
    </g>
  </g>
</svg>
`;

const markerIcon = L.divIcon({
  html: markerSvg,
  className: "custom-property-marker",
  iconSize: [27, 41],
  iconAnchor: [13.5, 41],
});

interface LocationMapViewProps {
  latitude: number;
  longitude: number;
}

const LocationMapView = ({ latitude, longitude }: LocationMapViewProps) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={markerIcon} />
    </MapContainer>
  );
};

export default LocationMapView;