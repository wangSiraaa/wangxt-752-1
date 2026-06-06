import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { EQUIPMENT_STATUS_LABELS } from '@/types';
import type { EquipmentStatus } from '@/types';
import { Wrench, Monitor, Eye, EyeOff, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const EQ_STATUS_OPTIONS: EquipmentStatus[] = ['normal', 'faulty', 'offline', 'handled'];

const EQ_TYPE_ICONS: Record<string, string> = {
  projector: '📽️',
  whiteboard: '📋',
  video_conf: '📹',
  speaker: '🔊',
  display: '🖥️',
};

const STATUS_FILTERS: { value: EquipmentStatus | 'all' | 'abnormal'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'abnormal', label: '仅异常' },
  { value: 'normal', label: '正常' },
  { value: 'faulty', label: '故障' },
  { value: 'offline', label: '离线' },
  { value: 'handled', label: '已处理' },
];

export default function Equipment() {
  const { rooms, updateEquipmentStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all' | 'abnormal'>('all');
  const [hideFaultyProjectorRooms, setHideFaultyProjectorRooms] = useState(false);

  const allEquipment = rooms.flatMap((room) =>
    room.equipment.map((eq) => ({ ...eq, roomName: room.name, roomId: room.id }))
  );

  const filteredEquipment = allEquipment.filter((e) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'abnormal') return e.status === 'faulty' || e.status === 'offline';
    return e.status === statusFilter;
  });

  const filteredRooms = hideFaultyProjectorRooms
    ? rooms.filter((r) => !r.equipment.some((e) => e.type === 'projector' && e.status === 'faulty'))
    : rooms;

  const faultyCount = allEquipment.filter((e) => e.status === 'faulty').length;
  const offlineCount = allEquipment.filter((e) => e.status === 'offline').length;
  const handledCount = allEquipment.filter((e) => e.status === 'handled').length;
  const normalCount = allEquipment.filter((e) => e.status === 'normal').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">设备标签复查</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            data-testid="hide-faulty-projector-btn"
            onClick={() => setHideFaultyProjectorRooms(!hideFaultyProjectorRooms)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              hideFaultyProjectorRooms
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {hideFaultyProjectorRooms ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            {hideFaultyProjectorRooms ? '已隐藏投影故障房间' : '隐藏投影故障房间'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700 font-medium">正常设备</p>
          <p className="text-3xl font-bold text-green-800">{normalCount}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700 font-medium">故障设备</p>
          <p className="text-3xl font-bold text-amber-800">{faultyCount}</p>
        </div>
        <div className="bg-gray-100 border border-gray-300 rounded-xl p-4">
          <p className="text-sm text-gray-600 font-medium">离线设备</p>
          <p className="text-3xl font-bold text-gray-800">{offlineCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium">已处理</p>
          <p className="text-3xl font-bold text-blue-800">{handledCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            data-testid={`eq-filter-${f.value}`}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              statusFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {hideFaultyProjectorRooms && (
        <div data-testid="hidden-notice" className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          💡 当前已隐藏投影设备故障的会议室，可点击上方按钮取消隐藏
        </div>
      )}

      <div className="space-y-4">
        {filteredRooms.map((room) => {
          const roomEq = filteredEquipment.filter((e) => e.roomId === room.id);
          if (roomEq.length === 0) return null;

          const hasFaultyProjector = room.equipment.some(
            (e) => e.type === 'projector' && e.status === 'faulty'
          );

          return (
            <div
              key={room.id}
              data-testid={`equipment-room-${room.id}`}
              className={cn(
                'bg-white rounded-xl border p-5 transition-all',
                hasFaultyProjector ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{room.name}</h2>
                  <span className="text-sm text-gray-500">{room.floor}</span>
                  {hasFaultyProjector && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      投影故障
                    </span>
                  )}
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
                      eq.status === 'handled' && 'border-blue-300 bg-blue-50',
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
                        eq.status === 'offline' && 'bg-gray-200 text-gray-700',
                        eq.status === 'handled' && 'bg-blue-100 text-blue-800'
                      )}>
                        {EQUIPMENT_STATUS_LABELS[eq.status]}
                      </span>
                    </div>

                    {eq.status !== 'normal' && (
                      <p className="text-xs text-gray-500 mb-2">
                        上次检查: {new Date(eq.lastChecked).toLocaleString('zh-CN')}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
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
