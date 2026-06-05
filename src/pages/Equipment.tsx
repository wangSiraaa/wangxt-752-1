import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { EQUIPMENT_STATUS_LABELS } from '@/types';
import type { EquipmentStatus } from '@/types';
import { Wrench, Monitor, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const EQ_STATUS_OPTIONS: EquipmentStatus[] = ['normal', 'faulty', 'offline'];

const EQ_TYPE_ICONS: Record<string, string> = {
  projector: '📽️',
  whiteboard: '📋',
  video_conf: '📹',
  speaker: '🔊',
  display: '🖥️',
};

export default function Equipment() {
  const { rooms, updateEquipmentStatus } = useStore();
  const [showFaultyOnly, setShowFaultyOnly] = useState(false);

  const allEquipment = rooms.flatMap((room) =>
    room.equipment.map((eq) => ({ ...eq, roomName: room.name, roomId: room.id }))
  );

  const filtered = showFaultyOnly
    ? allEquipment.filter((e) => e.status === 'faulty' || e.status === 'offline')
    : allEquipment;

  const faultyCount = allEquipment.filter((e) => e.status === 'faulty').length;
  const offlineCount = allEquipment.filter((e) => e.status === 'offline').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">设备标签复查</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="toggle-faulty-filter"
            onClick={() => setShowFaultyOnly(!showFaultyOnly)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              showFaultyOnly
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {showFaultyOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showFaultyOnly ? '仅异常' : '全部设备'}
          </button>
        </div>
      </div>

      {(faultyCount > 0 || offlineCount > 0) && (
        <div data-testid="equipment-summary" className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-700 font-medium">故障设备</p>
            <p className="text-3xl font-bold text-amber-800">{faultyCount}</p>
          </div>
          <div className="bg-gray-100 border border-gray-300 rounded-xl p-4">
            <p className="text-sm text-gray-600 font-medium">离线设备</p>
            <p className="text-3xl font-bold text-gray-800">{offlineCount}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rooms.map((room) => {
          const roomEq = filtered.filter((e) => e.roomId === room.id);
          if (roomEq.length === 0) return null;

          return (
            <div key={room.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{room.name}</h2>
                  <span className="text-sm text-gray-500">{room.floor}</span>
                </div>
                <StatusBadge status={room.status} size="sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roomEq.map((eq) => (
                  <div
                    key={eq.id}
                    data-testid={`equipment-${eq.id}`}
                    className={cn(
                      'rounded-lg border p-3 transition-all',
                      eq.status === 'faulty' && 'border-red-300 bg-red-50',
                      eq.status === 'offline' && 'border-gray-300 bg-gray-50',
                      eq.status === 'normal' && 'border-gray-200 bg-white'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{EQ_TYPE_ICONS[eq.type] ?? '🔧'}</span>
                        <span className="text-sm font-medium text-gray-900">{eq.name}</span>
                      </div>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-semibold',
                        eq.status === 'normal' && 'bg-green-100 text-green-800',
                        eq.status === 'faulty' && 'bg-red-100 text-red-800',
                        eq.status === 'offline' && 'bg-gray-200 text-gray-700'
                      )}>
                        {EQUIPMENT_STATUS_LABELS[eq.status]}
                      </span>
                    </div>

                    {eq.status !== 'normal' && (
                      <p className="text-xs text-gray-500 mb-2">
                        上次检查: {new Date(eq.lastChecked).toLocaleString('zh-CN')}
                      </p>
                    )}

                    <div className="flex gap-1">
                      {EQ_STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          data-testid={`eq-status-${eq.id}-${s}`}
                          onClick={() => updateEquipmentStatus(room.id, eq.id, s)}
                          className={cn(
                            'text-xs px-2 py-1 rounded font-medium transition-colors',
                            eq.status === s
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {EQUIPMENT_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
