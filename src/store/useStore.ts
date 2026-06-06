import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, MeetingRoom, Booking, BookingDraft, RoomStatus, EquipmentStatus } from '@/types';
import { SAMPLE_ROOMS, SAMPLE_BOOKINGS } from '@/data/sample';

interface AppState {
  role: Role;
  rooms: MeetingRoom[];
  bookings: Booking[];
  selectedRoomId: string | null;
  bookingError: string | null;
  showScanModal: boolean;

  setRole: (role: Role) => void;
  selectRoom: (id: string | null) => void;
  addBooking: (draft: BookingDraft) => string | null;
  cancelBooking: (id: string) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updateEquipmentStatus: (roomId: string, equipmentId: string, status: EquipmentStatus) => void;
  updateRoom: (room: MeetingRoom) => void;
  tickOvertime: () => void;
  resetToSample: () => void;
  setShowScanModal: (show: boolean) => void;
  scanEquipment: (equipmentId: string, status: EquipmentStatus) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      role: 'tenant',
      rooms: SAMPLE_ROOMS,
      bookings: SAMPLE_BOOKINGS,
      selectedRoomId: null,
      bookingError: null,
      showScanModal: false,

      setRole: (role) => set({ role }),

      selectRoom: (id) => set({ selectedRoomId: id, bookingError: null }),

      addBooking: (draft) => {
        const room = get().rooms.find((r) => r.id === draft.roomId);
        if (!room) return '会议室不存在';

        if (room.status === 'cleaning') {
          set({ bookingError: '该会议室正在清洁中，无法预约' });
          return '该会议室正在清洁中，无法预约';
        }

        if (room.status === 'maintenance') {
          set({ bookingError: '该会议室正在维护中，无法预约' });
          return '该会议室正在维护中，无法预约';
        }

        const start = new Date(draft.startTime).getTime();
        const end = new Date(draft.endTime).getTime();
        if (end <= start) {
          set({ bookingError: '结束时间必须晚于开始时间' });
          return '结束时间必须晚于开始时间';
        }

        const conflict = get().bookings.find(
          (b) =>
            b.roomId === draft.roomId &&
            new Date(b.startTime).getTime() < end &&
            new Date(b.endTime).getTime() > start
        );
        if (conflict) {
          set({ bookingError: '该时段已被预约，请选择其他时间' });
          return '该时段已被预约，请选择其他时间';
        }

        const newBooking: Booking = {
          id: `bk-${Date.now()}`,
          roomId: draft.roomId,
          title: draft.title,
          organizer: draft.organizer,
          startTime: draft.startTime,
          endTime: draft.endTime,
          isOvertime: false,
        };

        set((state) => ({
          bookings: [...state.bookings, newBooking],
          rooms: state.rooms.map((r) =>
            r.id === draft.roomId ? { ...r, status: 'occupied' as RoomStatus } : r
          ),
          bookingError: null,
        }));

        return null;
      },

      cancelBooking: (id) => {
        const booking = get().bookings.find((b) => b.id === id);
        if (!booking) return;

        const hasOtherActive = get().bookings.some(
          (b) => b.id !== id && b.roomId === booking.roomId && new Date(b.endTime).getTime() > Date.now()
        );

        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
          rooms: state.rooms.map((r) => {
            if (r.id !== booking.roomId) return r;
            if (hasOtherActive) return r;
            return { ...r, status: 'available' as RoomStatus };
          }),
        }));
      },

      updateRoomStatus: (roomId, status) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, status } : r)),
        })),

      updateEquipmentStatus: (roomId, equipmentId, status) =>
        set((state) => ({
          rooms: state.rooms.map((r) => {
            if (r.id !== roomId) return r;
            return {
              ...r,
              equipment: r.equipment.map((e) =>
                e.id === equipmentId ? { ...e, status } : e
              ),
            };
          }),
        })),

      updateRoom: (room) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === room.id ? room : r)),
        })),

      tickOvertime: () => {
        const now = Date.now();
        set((state) => ({
          bookings: state.bookings.map((b) => {
            const endMs = new Date(b.endTime).getTime();
            const isOver = endMs < now;
            return isOver !== b.isOvertime ? { ...b, isOvertime: isOver } : b;
          }),
        }));
      },

      resetToSample: () =>
        set({
          rooms: SAMPLE_ROOMS,
          bookings: SAMPLE_BOOKINGS,
          selectedRoomId: null,
          bookingError: null,
          showScanModal: false,
        }),

      setShowScanModal: (show) => set({ showScanModal: show }),

      scanEquipment: (equipmentId, status) =>
        set((state) => ({
          rooms: state.rooms.map((r) => {
            const hasEq = r.equipment.some((e) => e.id === equipmentId);
            if (!hasEq) return r;
            return {
              ...r,
              equipment: r.equipment.map((e) =>
                e.id === equipmentId
                  ? { ...e, status, lastChecked: new Date().toISOString() }
                  : e
              ),
            };
          }),
        })),
    }),
    {
      name: 'meeting-room-storage',
    }
  )
);
