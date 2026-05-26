import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, formatDateTime, isAdmin, toLocalInputValue } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Booking, Room, AnalyticsData, User } from '../types';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wifi, Monitor, Coffee, Video, Users, Download, Trash2, CalendarCheck, Image as ImageIcon } from 'lucide-react';

const AMENITIES_LIST = ['WiFi', 'Monitor', 'Coffee', 'Projector'];
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'WiFi': <Wifi size={14} />,
  'Monitor': <Monitor size={14} />,
  'Coffee': <Coffee size={14} />,
  'Projector': <Video size={14} />,
};

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
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const range = defaultRange();
  const [startTime, setStartTime] = useState(range.start);
  const [endTime, setEndTime] = useState(range.end);
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('8');
  const [roomImage, setRoomImage] = useState('');
  const [roomAmenities, setRoomAmenities] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const mine = await api.getMyBookings(token);
      setMyBookings(mine);
      if (admin) {
        const [all, stats, usersList] = await Promise.all([
          api.getAllBookings(token),
          api.getAnalytics(token),
          api.getAllUsers(token)
        ]);
        setAllBookings(all);
        setAnalytics(stats);
        setAllUsers(usersList);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  }, [token, admin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function searchAvailable() {
    try {
      const list = await api.getAvailableRooms(
        token,
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString(),
      );
      setAvailableRooms(list);
      setSelectedRoomId(list[0]?.id ?? '');
      toast.success(`Знайдено вільних кімнат: ${list.length}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка пошуку');
      setAvailableRooms([]);
    }
  }

  async function handleCreateBooking(e: FormEvent) {
    e.preventDefault();
    if (!selectedRoomId) {
      toast.error('Оберіть кімнату');
      return;
    }
    setBookingLoading(true);
    try {
      await api.createBooking(
        token,
        Number(selectedRoomId),
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString(),
      );
      toast.success('Бронювання успішно створено 🎉');
      setAvailableRooms([]);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка бронювання');
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Видалити це бронювання?')) return;
    try {
      await api.deleteBooking(token, id);
      toast.success('Бронювання видалено');
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка видалення');
    }
  }

  async function handleMakeAdmin(id: number) {
    if (!confirm('Надати цьому користувачу права адміністратора?')) return;
    try {
      await api.makeAdmin(token, id);
      toast.success('Права адміністратора надано!');
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка оновлення ролі');
    }
  }

  async function handleCreateRoom(e: FormEvent) {
    e.preventDefault();
    try {
      await api.createRoom(token, roomName, Number(roomCapacity), roomAmenities, roomImage);
      setRoomName('');
      setRoomCapacity('8');
      setRoomImage('');
      setRoomAmenities([]);
      toast.success('Кімнату успішно додано');
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка створення кімнати');
    }
  }

  const exportToCSV = () => {
    if (allBookings.length === 0) {
      toast.error('Немає даних для експорту');
      return;
    }
    const headers = ['ID', 'Кімната', 'Користувач', 'Початок', 'Кінець'];
    const rows = allBookings.map(b => [
      b.id,
      b.room?.name || `Кімната #${b.roomId}`,
      b.user?.email || `User #${b.userId}`,
      new Date(b.startTime).toLocaleString(),
      new Date(b.endTime).toLocaleString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Звіт завантажено');
  }

  const canDelete = (b: Booking) => {
    if (admin) return true;
    return new Date(b.startTime) > new Date();
  };

  if (loading) {
    return <div className="app-shell"><main className="app-main"><p className="muted text-center" style={{marginTop: '20vh'}}>Завантаження даних...</p></main></div>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <span className="brand-mark sm">◆</span>
          <div>
            <strong>Booking Premium</strong>
            <span className="header-email">{user!.email}</span>
          </div>
        </div>
        <div className="header-right">
          {admin && <span className="badge badge-admin">АДМІН</span>}
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Вийти
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-grid">
          
          {/* USER ACTIONS SECTION */}
          <section className="panel">
            <h2 className="flex-center"><CalendarCheck size={20} style={{marginRight: '8px'}}/> Нове бронювання</h2>
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
              <div className="mt-4">
                <h3 className="mb-2">Оберіть кімнату:</h3>
                <div className="room-cards-grid">
                  {availableRooms.map((r) => (
                    <div 
                      key={r.id} 
                      className={`room-card ${selectedRoomId === r.id ? 'selected' : ''}`}
                      onClick={() => setSelectedRoomId(r.id)}
                    >
                      {r.imageUrl && <div className="room-img" style={{backgroundImage: `url(${r.imageUrl})`}}></div>}
                      {!r.imageUrl && <div className="room-img-placeholder"><ImageIcon size={32} opacity={0.3}/></div>}
                      <div className="room-card-content">
                        <h4>{r.name}</h4>
                        <div className="room-meta">
                           <span className="flex-center" style={{gap:'4px'}}><Users size={14}/> {r.capacity} осіб</span>
                        </div>
                        {r.amenities && r.amenities.length > 0 && (
                          <div className="amenities-tags mt-2">
                            {r.amenities.map(am => (
                              <span key={am} className="amenity-tag" title={am}>
                                {AMENITY_ICONS[am] || am}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleCreateBooking}
                  className="btn btn-primary mt-4 w-full"
                  disabled={bookingLoading || !selectedRoomId}
                >
                  {bookingLoading ? 'Оформлення...' : 'Підтвердити бронювання'}
                </button>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Мої бронювання</h2>
            {myBookings.length === 0 ? (
              <div className="empty-state">
                <CalendarCheck size={48} opacity={0.2} />
                <p className="muted mt-2">У вас поки немає активних бронювань</p>
              </div>
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
                        title="Скасувати"
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ADMIN ANALYTICS SECTION */}
          {admin && analytics && (
            <section className="panel panel-wide animate-fade-in">
              <div className="flex-between mb-4">
                 <h2>Аналітика Системи</h2>
              </div>
              <div className="stats-grid mb-4">
                 <div className="stat-card">
                   <div className="stat-title">Всього Бронювань</div>
                   <div className="stat-value">{analytics.totalBookings}</div>
                 </div>
                 <div className="stat-card">
                   <div className="stat-title">Активних Кімнат</div>
                   <div className="stat-value">{analytics.totalRooms}</div>
                 </div>
                 <div className="stat-card">
                   <div className="stat-title">Зареєстровано Користувачів</div>
                   <div className="stat-value">{analytics.totalUsers}</div>
                 </div>
              </div>

              <h3>Популярність Кімнат (Бронювання)</h3>
              <div className="chart-container" style={{height: '300px', marginTop: '1rem'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.bookingsPerRoom}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Бронювань" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ADMIN MANAGEMENT SECTION */}
          {admin && (
            <>
              <section className="panel panel-wide">
                <div className="flex-between mb-4">
                  <h2>Усі бронювання (історія)</h2>
                  <button className="btn btn-secondary flex-center" onClick={exportToCSV}>
                    <Download size={16} style={{marginRight: '6px'}}/> Експорт CSV
                  </button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
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
                          <td className="muted">#{b.id}</td>
                          <td>{b.room?.name}</td>
                          <td>{b.user?.email}</td>
                          <td>{formatDateTime(b.startTime)}</td>
                          <td>{formatDateTime(b.endTime)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm text-danger"
                              onClick={() => handleDelete(b.id)}
                            >
                              <Trash2 size={16}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {allBookings.length === 0 && (
                        <tr><td colSpan={6} className="text-center muted py-4">Немає записів</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel panel-wide">
                <div className="flex-between mb-4">
                  <h2>Управління Користувачами</h2>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="muted">#{u.id}</td>
                          <td><strong>{u.email}</strong></td>
                          <td>
                            <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-outline'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.role !== 'ADMIN' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleMakeAdmin(u.id)}
                              >
                                Зробити Адміном
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel">
                <h2>Додати нову кімнату</h2>
                <form onSubmit={handleCreateRoom} className="form-grid">
                  <label>
                    Назва
                    <input
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                      placeholder="Офіс A"
                    />
                  </label>
                  <label>
                    Місткість (осіб)
                    <input
                      type="number"
                      min={1}
                      value={roomCapacity}
                      onChange={(e) => setRoomCapacity(e.target.value)}
                      required
                    />
                  </label>
                  <label className="col-span-2">
                    URL фотографії (опціонально)
                    <input
                      type="url"
                      value={roomImage}
                      onChange={(e) => setRoomImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </label>
                  <div className="col-span-2">
                    <span className="block mb-2 text-sm font-medium">Зручності</span>
                    <div className="amenities-selector">
                      {AMENITIES_LIST.map(am => (
                        <button 
                          key={am} 
                          type="button"
                          className={`amenity-chip ${roomAmenities.includes(am) ? 'active' : ''}`}
                          onClick={() => {
                            setRoomAmenities(prev => prev.includes(am) ? prev.filter(x => x !== am) : [...prev, am])
                          }}
                        >
                          {AMENITY_ICONS[am]} {am}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary col-span-2 mt-2">
                    Створити кімнату
                  </button>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
