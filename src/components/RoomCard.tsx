import type { MeetingRoom } from '@/types';
import { useStore } from '@/store/useStore';
import StatusBadge from './StatusBadge';
import { MapPin, Users, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: MeetingRoom;
  onClick?: () => void;
  variant?: 'card' | 'doorplate';
}

export default function RoomCard({ room, onClick, variant = 'card' }: RoomCardProps) {
  const bookings = useStore((s) => s.bookings);
  const activeBooking = bookings.find(
    (b) => b.roomId === room.id && 
    new Date(b.startTime).getTime() <= Date.now() && 
    (new Date(b.endTime).getTime() >= Date.now() || b.isOvertime)
  );
  const hasFaultyProjector = room.equipment.some((e) => e.type === 'projector' && e.status === 'faulty');
  const visibleTags = hasFaultyProjector ? room.tags.filter((t) => t !== '投影') : room.tags;

  if (variant === 'doorplate') {
    return (
      <div
        data-testid={`doorplate-${room.id}`}
        onClick={onClick}
        className={cn(
          'relative rounded-2xl p-6 border-2 transition-all cursor-pointer min-h-[280px] flex flex-col',
          room.status === 'cleaning' && 'border-yellow-400 bg-yellow-50',
          room.status === 'occupied' && !activeBooking?.isOvertime && 'border-blue-400 bg-blue-50',
          room.status === 'occupied' && activeBooking?.isOvertime && 'border-red-500 bg-red-50 animate-pulse-overtime',
          room.status === 'available' && 'border-green-400 bg-green-50',
          room.status === 'maintenance' && 'border-gray-400 bg-gray-50',
          hasFaultyProjector && 'ring-2 ring-amber-300 ring-offset-2'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
            <div className="flex items-center gap-1 text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{room.floor}</span>
            </div>
          </div>
          <StatusBadge status={room.status} size="lg" />
        </div>

        <div className="flex items-center gap-1.5 text-gray-600 mb-3">
          <Users className="w-4 h-4" />
          <span className="text-sm">{room.capacity}人</span>
        </div>

        {activeBooking && (
          <div className={cn(
            'mt-auto p-3 rounded-lg',
            activeBooking.isOvertime ? 'bg-red-100 border border-red-300' : 'bg-white/80'
          )}>
            <p className={cn(
              'font-semibold text-sm truncate',
              activeBooking.isOvertime ? 'text-red-800' : 'text-blue-800'
            )}>
              {activeBooking.isOvertime && <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />}
              {activeBooking.title}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              组织者: {activeBooking.organizer}
            </p>
            <p className={cn(
              'text-xs mt-0.5',
              activeBooking.isOvertime ? 'text-red-700 font-semibold' : 'text-gray-600'
            )}>
              {activeBooking.isOvertime ? (
                <>
                  ⚠️ 原 {new Date(activeBooking.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(activeBooking.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  {' · 已超时 '}
                  {Math.max(0, Math.floor((Date.now() - new Date(activeBooking.endTime).getTime()) / 60000))}
                  {' 分钟'}
                </>
              ) : (
                <>
                  {new Date(activeBooking.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(activeBooking.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </>
              )}
            </p>
          </div>
        )}

        {room.status === 'cleaning' && (
          <div data-testid="cleaning-notice" className="mt-auto p-3 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-semibold text-center">
            🧹 清洁中 · 暂不可预约
          </div>
        )}

        {hasFaultyProjector && (
          <div data-testid="projector-fault-notice" className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
            投影故障
          </div>
        )}

        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {visibleTags.map((tag) => (
              <span key={tag} className="text-xs bg-white/60 text-gray-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid={`room-card-${room.id}`}
      onClick={onClick}
      className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{room.name}</h3>
        <StatusBadge status={room.status} size="sm" />
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />{room.floor}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />{room.capacity}人
        </span>
      </div>
      {activeBooking && (
        <p className={cn(
          'text-sm mt-2 truncate',
          activeBooking.isOvertime ? 'text-red-600 font-semibold' : 'text-blue-600'
        )}>
          {activeBooking.isOvertime && '⚠️ '}
          {activeBooking.title}
        </p>
      )}
    </div>
  );
}
