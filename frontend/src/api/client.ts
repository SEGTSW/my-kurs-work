import type { Booking, Room, Role, UserSession } from '../types';

const API = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const body = data as { message?: string; error?: { name?: string } };
    let message = body.message || res.statusText;
    if (res.status === 500 && body.error?.name === 'PrismaClientInitializationError') {
      message = 'Сервер не підключений до бази даних. Перевірте DATABASE_URL у .env';
    }
    if (res.status >= 500 && message === 'Internal Server Error') {
      message = 'Помилка сервера. Переконайтесь, що бекенд запущений (npm run dev).';
    }
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<UserSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: 'USER' }),
    }),

  getRooms: (token: string) =>
    request<Room[]>('/rooms', {}, token),

  getAvailableRooms: (token: string, startTime: string, endTime: string) =>
    request<Room[]>(
      `/rooms/available?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
      {},
      token,
    ),

  createRoom: (token: string, name: string, capacity: number, amenities: string[] = [], imageUrl: string | null = null) =>
    request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, capacity, amenities, imageUrl }),
    }, token),

  getAnalytics: (token: string) =>
    request<import('../types').AnalyticsData>('/analytics', {}, token),

  getMyBookings: (token: string) =>
    request<Booking[]>('/bookings/my', {}, token),

  getAllBookings: (token: string) =>
    request<Booking[]>('/bookings', {}, token),

  createBooking: (
    token: string,
    roomId: number,
    startTime: string,
    endTime: string,
  ) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ roomId, startTime, endTime }),
    }, token),

  deleteBooking: (token: string, id: number) =>
    fetch(`${API}/bookings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok && res.status !== 204) {
        return res.json().then((d) => {
          throw new Error((d as { message?: string }).message || 'Помилка видалення');
        });
      }
    }),

  getAllUsers: (token: string) =>
    request<import('../types').User[]>('/users', {}, token),

  makeAdmin: (token: string, id: number) =>
    request<import('../types').User>(`/users/${id}/role`, {
      method: 'PATCH',
    }, token),
};

export function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function isAdmin(role: Role) {
  return role === 'ADMIN';
}
