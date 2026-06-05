import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import RoomCard from '@/components/RoomCard';
import OvertimeAlert from '@/components/OvertimeAlert';
import { useNavigate } from 'react-router-dom';
import type { RoomStatus } from '@/types';
import { ROLE_PERMISSIONS } from '@/types';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

const STATUS_FILTERS: { value: RoomStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'available', label: '空闲' },
  { value: 'occupied', label: '占用中' },
  { value: 'cleaning', label: '清洁中' },
  { value: 'maintenance', label: '维护中' },
];

export default function Home() {
  const { rooms, bookings, role, tickOvertime } = useStore();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const interval = setInterval(tickOvertime, 30000);
    tickOvertime();
    return () => clearInterval(interval);
  }, [tickOvertime]);

  const canBook = ROLE_PERMISSIONS[role].canBook;
  const overtimeBookings = bookings.filter((b) => b.isOvertime);

  const filteredRooms = rooms.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchText && !r.name.includes(searchText) && !r.floor.includes(searchText)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {overtimeBookings.length > 0 && (
        <div data-testid="overtime-banner" className="mb-6 space-y-2">
          {overtimeBookings.map((b) => (
            <OvertimeAlert key={b.id} booking={b} />
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索会议室名称或楼层..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              data-testid={`filter-${f.value}`}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            variant="doorplate"
            onClick={() => {
              if (canBook && room.status !== 'cleaning' && room.status !== 'maintenance') {
                navigate(`/booking?roomId=${room.id}`);
              }
            }}
          />
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">没有符合条件的会议室</p>
        </div>
      )}
    </div>
  );
}
