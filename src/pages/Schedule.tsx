import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import OvertimeAlert from '@/components/OvertimeAlert';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Schedule() {
  const { rooms, bookings, role, tickOvertime, cancelBooking } = useStore();

  useEffect(() => {
    const interval = setInterval(tickOvertime, 30000);
    tickOvertime();
    return () => clearInterval(interval);
  }, [tickOvertime]);

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const overtimeCount = bookings.filter((b) => b.isOvertime).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {role === 'frontdesk' ? '前台 · 时段列表' : '管理员 · 时段总览'}
          </h1>
        </div>
        {overtimeCount > 0 && (
          <div data-testid="overtime-count" className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            {overtimeCount} 场会议已超时
          </div>
        )}
      </div>

      {bookings.filter((b) => b.isOvertime).length > 0 && (
        <div className="mb-6 space-y-2">
          <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide">超时会议</h2>
          {bookings
            .filter((b) => b.isOvertime)
            .map((b) => (
              <OvertimeAlert key={b.id} booking={b} />
            ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm" data-testid="schedule-table">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">会议室</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">会议主题</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">组织者</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">时段</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">状态</th>
              {role === 'admin' && <th className="text-right px-4 py-3 font-semibold text-gray-600">操作</th>}
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map((b) => {
              const room = rooms.find((r) => r.id === b.roomId);
              return (
                <tr
                  key={b.id}
                  data-testid={`schedule-row-${b.id}`}
                  className={cn(
                    'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                    b.isOvertime && 'bg-red-50/50'
                  )}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{room?.name ?? '—'}</td>
                  <td className={cn('px-4 py-3', b.isOvertime && 'text-red-700 font-semibold')}>
                    {b.isOvertime && <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-red-500" />}
                    {b.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.organizer}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(b.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(b.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {b.isOvertime ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        已超时
                      </span>
                    ) : new Date(b.startTime).getTime() > Date.now() ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        待开始
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        进行中
                      </span>
                    )}
                  </td>
                  {role === 'admin' && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="取消预约"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedBookings.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            暂无预约记录
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-1">总会议室</h3>
          <p className="text-3xl font-bold text-gray-900">{rooms.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-1">当前占用</h3>
          <p className="text-3xl font-bold text-blue-600">{rooms.filter((r) => r.status === 'occupied').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-1">超时会议</h3>
          <p className="text-3xl font-bold text-red-600">{overtimeCount}</p>
        </div>
      </div>
    </div>
  );
}
