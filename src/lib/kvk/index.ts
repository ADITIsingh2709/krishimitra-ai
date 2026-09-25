import { KvkCenter } from '@/types';
import { getKvkCenters } from '@/lib/db';

// Haversine formula to compute great-circle distance between two GPS coordinates in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function findNearbyKvkCenters(params: {
  lat?: number;
  lng?: number;
  state?: string;
  district?: string;
  limit?: number;
}): Promise<KvkCenter[]> {
  const limit = params.limit || 5;
  const allCenters = await getKvkCenters();

  // If farmer coordinates are available, sort by physical distance
  if (params.lat && params.lng) {
    const scored = allCenters.map(center => {
      const distanceKm = calculateDistanceKm(params.lat!, params.lng!, center.latitude, center.longitude);
      return { ...center, distanceKm };
    });

    scored.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    return scored.slice(0, limit);
  }

  // Filter by state / district match if coordinates unavailable
  if (params.state || params.district) {
    const matched = allCenters.filter(c => {
      const matchState = !params.state || c.state.toLowerCase() === params.state.toLowerCase();
      const matchDistrict = !params.district || c.district.toLowerCase() === params.district.toLowerCase();
      return matchState && matchDistrict;
    });

    if (matched.length > 0) {
      return matched.slice(0, limit);
    }
  }

  return allCenters.slice(0, limit);
}
