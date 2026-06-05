import { AlertTriangle, Clock } from 'lucide-react';
import type { Booking } from '@/types';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface OvertimeAlertProps {
  booking: Booking;
}

export default function OvertimeAlert({ booking }: OvertimeAlertProps) {
  const rooms = useStore((s) => s.rooms);
  const room = rooms.find((r) => r.id === booking.roomId);
  const endMs = new Date(booking.endTime).getTime();
  const overMs = Date.now() - endMs;
  const overMinutes = Math.max(0, Math.floor(overMs / 60000));

  if (!booking.isOvertime) return null;

  return (
    <div
      data-testid="overtime-alert"
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border',
        'bg-red-50 border-red-300 text-red-800',
        'animate-pulse-overtime'
      )}
    >
      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          「{booking.title}」已超时 {overMinutes} 分钟
        </p>
        <p className="text-xs text-red-600">
          {room?.name ?? '未知会议室'} · 组织者: {booking.organizer}
        </p>
      </div>
      <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
    </div>
  );
}
