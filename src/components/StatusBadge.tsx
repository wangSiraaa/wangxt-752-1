import { ROOM_STATUS_LABELS } from '@/types';
import type { RoomStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<RoomStatus, string> = {
  available: 'bg-green-100 text-green-800 border-green-300',
  occupied: 'bg-blue-100 text-blue-800 border-blue-300',
  cleaning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  maintenance: 'bg-red-100 text-red-800 border-red-300',
};

const STATUS_DOTS: Record<RoomStatus, string> = {
  available: 'bg-green-500',
  occupied: 'bg-blue-500',
  cleaning: 'bg-yellow-500',
  maintenance: 'bg-red-500',
};

interface StatusBadgeProps {
  status: RoomStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export default function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      data-testid={`status-badge-${status}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        STATUS_COLORS[status],
        sizeClasses[size]
      )}
    >
      {showDot && (
        <span className={cn('w-2 h-2 rounded-full', STATUS_DOTS[status])} />
      )}
      {ROOM_STATUS_LABELS[status]}
    </span>
  );
}
