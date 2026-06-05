import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { BookingDraft } from '@/types';
import { AlertCircle, CalendarDays, Clock, User, BookOpen } from 'lucide-react';

export default function BookingPage() {
  const { rooms, addBooking, bookingError, selectRoom } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedRoomId = searchParams.get('roomId') ?? '';

  const [draft, setDraft] = useState<BookingDraft>({
    roomId: preselectedRoomId,
    title: '',
    organizer: '',
    startTime: '',
    endTime: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedRoom = rooms.find((r) => r.id === draft.roomId);

  useEffect(() => {
    if (preselectedRoomId) {
      setDraft((prev) => ({ ...prev, roomId: preselectedRoomId }));
    }
  }, [preselectedRoomId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!draft.roomId) {
      setLocalError('请选择会议室');
      return;
    }

    if (!draft.title.trim()) {
      setLocalError('请输入会议主题');
      return;
    }

    if (!draft.organizer.trim()) {
      setLocalError('请输入组织者');
      return;
    }

    if (!draft.startTime || !draft.endTime) {
      setLocalError('请选择开始和结束时间');
      return;
    }

    const error = addBooking(draft);
    if (error) {
      setLocalError(error);
      return;
    }

    setSuccessMsg(`预约成功！「${selectedRoom?.name}」已为您锁定`);
    selectRoom(null);
    setTimeout(() => navigate('/'), 1500);
  };

  const now = new Date();
  const minTime = now.toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">预约会议室</h1>
      </div>

      {(localError || bookingError) && (
        <div
          data-testid="booking-error"
          className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm font-medium">{localError || bookingError}</p>
        </div>
      )}

      {successMsg && (
        <div
          data-testid="booking-success"
          className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg"
        >
          <p className="text-green-800 text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">选择会议室</label>
          <select
            data-testid="select-room"
            value={draft.roomId}
            onChange={(e) => {
              setDraft({ ...draft, roomId: e.target.value });
              setLocalError(null);
              setSuccessMsg(null);
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择...</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id} disabled={r.status === 'cleaning' || r.status === 'maintenance'}>
                {r.name}（{r.floor}·{r.capacity}人）{r.status === 'cleaning' ? ' · 🧹清洁中' : ''}{r.status === 'maintenance' ? ' · 🔧维护中' : ''}
              </option>
            ))}
          </select>

          {selectedRoom?.status === 'cleaning' && (
            <div data-testid="cleaning-block" className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
              ⚠️ 该会议室正在清洁中，暂时无法预约。请选择其他会议室或稍后再试。
            </div>
          )}
          {selectedRoom?.status === 'maintenance' && (
            <div data-testid="maintenance-block" className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-sm">
              🔧 该会议室正在维护中，暂时无法预约。
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <CalendarDays className="w-4 h-4 inline mr-1" />
            会议主题
          </label>
          <input
            type="text"
            data-testid="input-title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="例如：Q3产品规划"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <User className="w-4 h-4 inline mr-1" />
            组织者
          </label>
          <input
            type="text"
            data-testid="input-organizer"
            value={draft.organizer}
            onChange={(e) => setDraft({ ...draft, organizer: e.target.value })}
            placeholder="您的姓名"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" />
              开始时间
            </label>
            <input
              type="datetime-local"
              data-testid="input-start"
              value={draft.startTime}
              min={minTime}
              onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" />
              结束时间
            </label>
            <input
              type="datetime-local"
              data-testid="input-end"
              value={draft.endTime}
              min={draft.startTime || minTime}
              onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          data-testid="submit-booking"
          disabled={selectedRoom?.status === 'cleaning' || selectedRoom?.status === 'maintenance'}
          className="w-full py-3 rounded-lg font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          确认预约
        </button>
      </form>
    </div>
  );
}
