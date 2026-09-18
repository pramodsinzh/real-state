"use client";
import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

interface MapViewProps {
  properties: PropertyWithLocation[];
  center: [number, number];
}

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
  popupAnchor: [0, -38],
});

/** Nudge markers that share the same lat/lng so they don't stack as one pin. */
function withSpreadCoordinates(properties: PropertyWithLocation[]) {
  const seen = new Map<string, number>();

  return properties.map((property) => {
    const lat = property.location?.coordinates?.latitude;
    const lng = property.location?.coordinates?.longitude;

    if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
      return { property, position: null as [number, number] | null };
    }

    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);

    // ~11m offset per duplicate so stacked listings remain clickable
    const offset = count * 0.0001;
    return {
      property,
      position: [lat + offset, lng + offset] as [number, number],
    };
  });
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();

    invalidate();
    const timeouts = [100, 300, 600].map((delay) =>
      setTimeout(invalidate, delay)
    );

    const resizeObserver = new ResizeObserver(() => invalidate());
    resizeObserver.observe(map.getContainer());

    window.addEventListener("resize", invalidate);

    return () => {
      timeouts.forEach(clearTimeout);
      resizeObserver.disconnect();
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  return null;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;

    if (positions.length === 1) {
      map.setView(positions[0], 12, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true });
  }, [map, positions]);

  return null;
}

const MapView = ({ properties, center }: MapViewProps) => {
  const leafletCenter: [number, number] = [center[1], center[0]];
  const markers = useMemo(() => withSpreadCoordinates(properties), [properties]);
  const positions = useMemo(
    () => markers.flatMap((m) => (m.position ? [m.position] : [])),
    [markers]
  );

  return (
    <div className="w-full h-full relative z-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={leafletCenter}
        zoom={9}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <MapResizeHandler />
        <FitBounds positions={positions} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ property, position }) =>
          position ? (
            <Marker
              key={property.id}
              position={position}
              icon={markerIcon}
            >
              <Popup className="property-popup" minWidth={190} closeButton>
                <Link href={`/search/${property.id}`} target="_blank" className="flex flex-col">
                  <div className="w-full h-17 bg-gray-800 overflow-hidden flex items-center justify-center">
                    {property.photoUrls?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={property.photoUrls[0]}
                        alt={property.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement?.classList.add("image-fallback");
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="items-center justify-between px-3.5 mt-2">
                    <h3 className="font-semibold text-white text-sm leading-snug truncate">
                      {property.name}
                    </h3>
                    <p className="text-sm whitespace-nowrap">
                      <span className="font-semibold text-white">${property.pricePerMonth}</span>
                      <span className="text-gray-400"> / mo</span>
                    </p>
                  </div>
                </Link>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
