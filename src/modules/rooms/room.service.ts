import { HttpError } from '../../shared/http-error';
import { roomRepository } from './room.repository';
import { serializeRoom } from './room.mapper';

export const roomService = {
  async getRooms() {
    const rooms = await roomRepository.findAll();
    return rooms.map(serializeRoom);
  },

  async createRoom(input: {
    name?: string;
    capacity?: number | string;
    amenities?: string[];
    imageUrl?: string | null;
  }) {
    if (!input.name || !input.capacity) {
      throw new HttpError(400, 'Name and capacity are required');
    }

    const room = await roomRepository.create({
      name: input.name,
      capacity: Number(input.capacity),
      amenities: JSON.stringify(input.amenities || []),
      imageUrl: input.imageUrl || null,
    });

    return serializeRoom(room);
  },

  async getAvailableRooms(input: { startTime?: string; endTime?: string }) {
    if (!input.startTime || !input.endTime) {
      throw new HttpError(400, 'startTime and endTime are required');
    }

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      throw new HttpError(400, 'Invalid time range');
    }

    const rooms = await roomRepository.findAvailable(start, end);
    return rooms.map(serializeRoom);
  },
};
