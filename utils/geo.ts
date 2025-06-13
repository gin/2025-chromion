import { Coordinate } from '@/types/geo.types';

/**
 * Calculate distance in meters between two coordinates using the Haversine formula.
 */

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3; // Earth's radius in meters

  const φ1 = toRadians(coord1.latitude);
  const φ2 = toRadians(coord2.latitude);
  const Δφ = toRadians(coord2.latitude - coord1.latitude);
  const Δλ = toRadians(coord2.longitude - coord1.longitude);

  const a = Math.sin(Δφ / 2)**2 +
            Math.cos(φ1) *
            Math.cos(φ2) *
            Math.sin(Δλ / 2)**2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Default export for backward compatibility
export default calculateDistance;
