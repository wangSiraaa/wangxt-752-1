import type { MeetingRoom, Booking, Role } from '@/types';

function h(hoursFromNow: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + hoursFromNow * 60);
  return d.toISOString();
}

export const SAMPLE_ROOMS: MeetingRoom[] = [
  {
    id: 'room-1',
    name: '星辰厅',
    floor: '3F',
    capacity: 12,
    status: 'available',
    tags: ['投影', '视频会议'],
    equipment: [
      { id: 'eq-1', name: '投影仪', type: 'projector', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
      { id: 'eq-2', name: '电子白板', type: 'whiteboard', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
      { id: 'eq-3', name: '视频会议终端', type: 'video_conf', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
    ],
  },
  {
    id: 'room-2',
    name: '银河厅',
    floor: '3F',
    capacity: 20,
    status: 'occupied',
    tags: ['投影', '视频会议', '音响'],
    equipment: [
      { id: 'eq-4', name: '投影仪', type: 'projector', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
      { id: 'eq-5', name: '音响系统', type: 'speaker', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
      { id: 'eq-6', name: '大屏显示器', type: 'display', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
    ],
  },
  {
    id: 'room-3',
    name: '晨曦室',
    floor: '5F',
    capacity: 8,
    status: 'cleaning',
    tags: ['白板'],
    equipment: [
      { id: 'eq-7', name: '电子白板', type: 'whiteboard', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
    ],
  },
  {
    id: 'room-4',
    name: '曙光室',
    floor: '5F',
    capacity: 8,
    status: 'available',
    tags: ['投影', '白板'],
    equipment: [
      { id: 'eq-8', name: '投影仪', type: 'projector', status: 'faulty', lastChecked: '2026-06-05T06:00:00' },
      { id: 'eq-9', name: '电子白板', type: 'whiteboard', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
    ],
  },
  {
    id: 'room-5',
    name: '旭日厅',
    floor: '7F',
    capacity: 30,
    status: 'occupied',
    tags: ['投影', '视频会议', '音响', '大屏'],
    equipment: [
      { id: 'eq-10', name: '投影仪', type: 'projector', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
      { id: 'eq-11', name: '视频会议终端', type: 'video_conf', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
      { id: 'eq-12', name: '音响系统', type: 'speaker', status: 'normal', lastChecked: '2026-06-05T08:00:00' },
      { id: 'eq-13', name: '大屏显示器', type: 'display', status: 'offline', lastChecked: '2026-06-04T18:00:00' },
    ],
  },
  {
    id: 'room-6',
    name: '朝晖室',
    floor: '7F',
    capacity: 6,
    status: 'maintenance',
    tags: ['白板'],
    equipment: [
      { id: 'eq-14', name: '电子白板', type: 'whiteboard', status: 'faulty', lastChecked: '2026-06-04T10:00:00' },
    ],
  },
];

export const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: 'bk-1',
    roomId: 'room-2',
    title: '产品需求评审',
    organizer: '张伟',
    startTime: h(-1),
    endTime: h(-0.25),
    isOvertime: true,
  },
  {
    id: 'bk-2',
    roomId: 'room-2',
    title: '技术方案讨论',
    organizer: '李娜',
    startTime: h(1),
    endTime: h(2),
    isOvertime: false,
  },
  {
    id: 'bk-3',
    roomId: 'room-5',
    title: '全员季度汇报',
    organizer: '王磊',
    startTime: h(-0.5),
    endTime: h(0.5),
    isOvertime: false,
  },
  {
    id: 'bk-4',
    roomId: 'room-5',
    title: '投资人路演',
    organizer: '赵敏',
    startTime: h(2),
    endTime: h(3.5),
    isOvertime: false,
  },
  {
    id: 'bk-5',
    roomId: 'room-1',
    title: '设计走查',
    organizer: '陈静',
    startTime: h(3),
    endTime: h(4),
    isOvertime: false,
  },
];
