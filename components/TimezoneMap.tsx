'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { GlassCard } from './GlassCard';
import type { LatLngExpression, LeafletMouseEvent } from 'leaflet';
import { useMapEvents, useMap } from 'react-leaflet';
import type { MarkerIconProps } from './MarkerIcon';
import 'leaflet/dist/leaflet.css';

export interface TimezoneMapProps {
  selectedTimezone: string;
  onTimezoneChange: (value: string) => void;
  isDark: boolean;
  selectedLocation: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

// Create a custom hook for map events
function useMapClick(onMapClick: (lat: number, lng: number) => void) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
}

// Create a custom hook for map updates
function useMapCenter(center: LatLngExpression) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapClick(onMapClick);
  return null;
}

function MapUpdater({ center }: { center: LatLngExpression }) {
  useMapCenter(center);
  return null;
}

const MarkerIcon = dynamic<MarkerIconProps>(
  () => import('./MarkerIcon').then((mod) => mod.default),
  { ssr: false }
);

export default function TimezoneMap({ 
  isDark,
  selectedLocation,
  onLocationSelect 
}: TimezoneMapProps) {
  const mapRef = useRef(null);

  return (
    <GlassCard>
      <div className="p-4 space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click anywhere on the map to select a timezone
        </p>
        <div style={{ height: '400px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <MapContainer
            center={[selectedLocation.lat, selectedLocation.lng]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={isDark ? 
                'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />
            <MarkerIcon position={[selectedLocation.lat, selectedLocation.lng]} />
            <MapEvents onMapClick={onLocationSelect} />
            <MapUpdater center={[selectedLocation.lat, selectedLocation.lng]} />
          </MapContainer>
        </div>
      </div>
    </GlassCard>
  );
} 