export type Role = 'USER' | 'ADMIN';

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
