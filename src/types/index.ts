export type Role = 'tenant' | 'frontdesk' | 'admin';

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export type EquipmentStatus = 'normal' | 'faulty' | 'offline' | 'handled';

export type DoorplateStatus = 'normal' | 'abnormal' | 'handled';

export interface Equipment {
  id: string;
  name: string;
  type: 'projector' | 'whiteboard' | 'video_conf' | 'speaker' | 'display';
  status: EquipmentStatus;
  lastChecked: string;
}

export interface MeetingRoom {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  status: RoomStatus;
  equipment: Equipment[];
  tags: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  organizer: string;
  startTime: string;
  endTime: string;
  isOvertime: boolean;
}

export interface BookingDraft {
  roomId: string;
  title: string;
  organizer: string;
  startTime: string;
  endTime: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  tenant: '园区租户',
  frontdesk: '前台',
  admin: '会议室管理员',
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: '空闲',
  occupied: '占用中',
  cleaning: '清洁中',
  maintenance: '维护中',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  normal: '正常',
  faulty: '故障',
  offline: '离线',
  handled: '已处理',
};

export const DOORPLATE_STATUS_LABELS: Record<DoorplateStatus, string> = {
  normal: '正常',
  abnormal: '异常',
  handled: '已处理',
};

export const ROLE_PERMISSIONS: Record<Role, { canBook: boolean; canViewSchedule: boolean; canManageEquipment: boolean; canEditRoom: boolean }> = {
  tenant: { canBook: true, canViewSchedule: false, canManageEquipment: false, canEditRoom: true },
  frontdesk: { canBook: false, canViewSchedule: true, canManageEquipment: false, canEditRoom: false },
  admin: { canBook: false, canViewSchedule: true, canManageEquipment: true, canEditRoom: false },
};
