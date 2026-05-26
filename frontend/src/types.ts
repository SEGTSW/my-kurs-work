export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface UserSession {
  token: string;
  role: Role;
  email: string;
  id: number;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  amenities: string[];
  imageUrl: string | null;
}

export interface AnalyticsData {
  totalBookings: number;
  totalRooms: number;
  totalUsers: number;
  bookingsPerRoom: { name: string; count: number }[];
}

export interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  roomId: number;
  userId: number;
  room?: Room;
  user?: { email: string; role: Role };
}
