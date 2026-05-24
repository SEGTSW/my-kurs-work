import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, formatDateTime, isAdmin, toLocalInputValue } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Booking, Room } from '../types';

function defaultRange() {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 2);
  return {
    start: toLocalInputValue(start.toISOString()),
    end: toLocalInputValue(end.toISOString()),
  };
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const token = user!.token;
  const admin = isAdmin(user!.role);

  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const range = defaultRange();
  const [startTime, setStartTime] = useState(range.start);
  const [endTime, setEndTime] = useState(range.end);
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('8');

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [mine, allRooms] = await Promise.all([
        api.getMyBookings(token),
        api.getRooms(token),
      ]);
      setMyBookings(mine);
      setRooms(allRooms);
      if (admin) {
        const all = await api.getAllBookings(token);
        setAllBookings(all);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  }, [token, admin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function searchAvailable() {
    setError('');
    try {
      const list = await api.getAvailableRooms(
        token,
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString(),
      );
      setAvailableRooms(list);
      setSelectedRoomId(list[0]?.id ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка пошуку');
      setAvailableRooms([]);
    }
  }

  async function handleCreateBooking(e: FormEvent) {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Оберіть кімнату');
      return;
    }
    setBookingLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.createBooking(
        token,
        Number(selectedRoomId),
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString(),
      );
      setSuccess('Бронювання створено');
      await loadData();
      await searchAvailable();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка бронювання');
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Видалити це бронювання?')) return;
    setError('');
    try {
      await api.deleteBooking(token, id);
      setSuccess('Бронювання видалено');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка видалення');
    }
  }

  async function handleCreateRoom(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.createRoom(token, roomName, Number(roomCapacity));
      setRoomName('');
      setSuccess('Кімнату додано');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка створення кімнати');
    }
  }

  const canDelete = (b: Booking) => {
    if (admin) return true;
    return new Date(b.startTime) > new Date();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <span className="brand-mark sm">◆</span>
          <div>
            <strong>Booking System</strong>
            <span className="header-email">{user!.email}</span>
          </div>
        </div>
        <div className="header-right">
          {admin && <span className="badge badge-admin">ADMIN</span>}
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Вийти
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <p className="muted">Завантаження…</p>
        ) : (
          <div className="dashboard-grid">
            <section className="panel">
              <h2>Нове бронювання</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  searchAvailable();
                }}
                className="form-grid"
              >
                <label>
                  Початок
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Кінець
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </label>
                <button type="submit" className="btn btn-secondary">
                  Знайти вільні кімнати
                </button>
              </form>

              {availableRooms.length > 0 && (
                <form onSubmit={handleCreateBooking} className="booking-pick">
                  <label>
                    Кімната
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                    >
                      {availableRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (до {r.capacity} осіб)
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Бронювання…' : 'Забронювати'}
                  </button>
                </form>
              )}

              <div className="rooms-preview">
                <h3>Усі кімнати ({rooms.length})</h3>
                <ul className="room-chips">
                  {rooms.map((r) => (
                    <li key={r.id}>
                      {r.name} · {r.capacity} місць
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="panel">
              <h2>Мої бронювання</h2>
              {myBookings.length === 0 ? (
                <p className="muted">У вас поки немає бронювань</p>
              ) : (
                <ul className="booking-list">
                  {myBookings.map((b) => (
                    <li key={b.id} className="booking-item">
                      <div>
                        <strong>{b.room?.name ?? `Кімната #${b.roomId}`}</strong>
                        <span>
                          {formatDateTime(b.startTime)} — {formatDateTime(b.endTime)}
                        </span>
                      </div>
                      {canDelete(b) && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(b.id)}
                        >
                          Скасувати
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {admin && (
              <>
                <section className="panel panel-wide">
                  <h2>Усі бронювання (адмін)</h2>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Кімната</th>
                          <th>Користувач</th>
                          <th>Початок</th>
                          <th>Кінець</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBookings.map((b) => (
                          <tr key={b.id}>
                            <td>{b.room?.name}</td>
                            <td>{b.user?.email}</td>
                            <td>{formatDateTime(b.startTime)}</td>
                            <td>{formatDateTime(b.endTime)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(b.id)}
                              >
                                Видалити
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="panel">
                  <h2>Додати кімнату</h2>
                  <form onSubmit={handleCreateRoom} className="form-grid">
                    <label>
                      Назва
                      <input
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        required
                        placeholder="Переговорна D"
                      />
                    </label>
                    <label>
                      Місткість
                      <input
                        type="number"
                        min={1}
                        value={roomCapacity}
                        onChange={(e) => setRoomCapacity(e.target.value)}
                        required
                      />
                    </label>
                    <button type="submit" className="btn btn-primary">
                      Створити
                    </button>
                  </form>
                </section>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
