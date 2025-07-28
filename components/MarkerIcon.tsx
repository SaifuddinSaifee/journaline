'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

export interface MarkerIconProps {
  position: [number, number];
}

// Define interface for Icon prototype
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

export default function MarkerIcon({ position }: MarkerIconProps) {
  useEffect(() => {
    // Fix for default marker icon
    delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: '/marker-icon.png',
      iconRetinaUrl: '/marker-icon-2x.png',
      shadowUrl: '/marker-shadow.png',
    });
  }, []);

  return <Marker position={position} />;
} 