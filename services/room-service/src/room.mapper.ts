import { Room } from '@prisma/client';

function parseAmenities(value: string) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeRoom(room: Room) {
  return {
    ...room,
    amenities: parseAmenities(room.amenities),
  };
}
