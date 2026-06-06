import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import RoomCard from '@/components/RoomCard';
import OvertimeAlert from '@/components/OvertimeAlert';
import { useNavigate } from 'react-router-dom';
import type { RoomStatus, DoorplateStatus } from '@/types';
import { ROLE_PERMISSIONS, DOORPLATE_STATUS_LABELS } from '@/types';
import { Search, Filter, CheckCircle, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: { value: RoomStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'available', label: '空闲' },
  { value: 'occupied', label: '占用中' },
  { value: 'cleaning', label: '清洁中' },
  { value: 'maintenance', label: '维护中' },
];

const DOORPLATE_FILTERS: { value: DoorplateStatus | 'all'; label: string; icon: typeof CheckCircle }[] = [
  { value: 'all', label: '全部门牌', icon: Filter },
  { value: 'normal', label: '正常', icon: CheckCircle },
  { value: 'abnormal', label: '异常', icon: AlertTriangle },
  { value: 'handled', label: '已处理', icon: ClipboardCheck },
];

function getDoorplateStatus(room: { equipment: { status: string }[] }): DoorplateStatus {
  const hasFaultyOrOffline = room.equipment.some(
    (e) => e.status === 'faulty' || e.status === 'offline'
  );
  const allHandledOrNormal = room.equipment.every(
    (e) => e.status === 'normal' || e.status === 'handled'
  );
  const hasHandled = room.equipment.some((e) => e.status === 'handled');

  if (!hasFaultyOrOffline && !hasHandled) return 'normal';
  if (allHandledOrNormal && hasHandled) return 'handled';
  return 'abnormal';
}

export default function Home() {
  const { rooms, bookings, role, tickOvertime } = useStore();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [doorplateFilter, setDoorplateFilter] = useState<DoorplateStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const interval = setInterval(tickOvertime, 30000);
    tickOvertime();
    return () => clearInterval(interval);
  }, [tickOvertime]);

  const canBook = ROLE_PERMISSIONS[role].canBook;
  const overtimeBookings = bookings.filter((b) => b.isOvertime);

  const roomsWithDoorplateStatus = rooms.map((r) => ({
    ...r,
    doorplateStatus: getDoorplateStatus(r),
  }));

  const normalCount = roomsWithDoorplateStatus.filter((r) => r.doorplateStatus === 'normal').length;
  const abnormalCount = roomsWithDoorplateStatus.filter((r) => r.doorplateStatus === 'abnormal').length;
  const handledCount = roomsWithDoorplateStatus.filter((r) => r.doorplateStatus === 'handled').length;

  const filteredRooms = roomsWithDoorplateStatus.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (doorplateFilter !== 'all' && r.doorplateStatus !== doorplateFilter) return false;
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

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div data-testid="doorplate-stat-normal" className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700 font-medium">门牌正常</p>
          </div>
          <p className="text-2xl font-bold text-green-800">{normalCount}</p>
        </div>
        <div data-testid="doorplate-stat-abnormal" className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-700 font-medium">门牌异常</p>
          </div>
          <p className="text-2xl font-bold text-amber-800">{abnormalCount}</p>
        </div>
        <div data-testid="doorplate-stat-handled" className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-700 font-medium">已处理</p>
          </div>
          <p className="text-2xl font-bold text-blue-800">{handledCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {DOORPLATE_FILTERS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.value}
              data-testid={`doorplate-filter-${f.value}`}
              onClick={() => setDoorplateFilter(f.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                doorplateFilter === f.value
                  ? f.value === 'normal' ? 'bg-green-600 text-white'
                  : f.value === 'abnormal' ? 'bg-amber-600 text-white'
                  : f.value === 'handled' ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

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
          <div key={room.id} className="relative">
            <div
              data-testid={`doorplate-status-badge-${room.id}`}
              className={cn(
                'absolute -top-2 -right-2 z-10 px-2 py-0.5 rounded-full text-xs font-bold shadow-md',
                room.doorplateStatus === 'normal' && 'bg-green-500 text-white',
                room.doorplateStatus === 'abnormal' && 'bg-amber-500 text-white',
                room.doorplateStatus === 'handled' && 'bg-blue-500 text-white'
              )}
            >
              {DOORPLATE_STATUS_LABELS[room.doorplateStatus]}
            </div>
            <RoomCard
              room={room}
              variant="doorplate"
              onClick={() => {
                if (canBook && room.status !== 'cleaning' && room.status !== 'maintenance') {
                  navigate(`/booking?roomId=${room.id}`);
                }
              }}
            />
          </div>
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
