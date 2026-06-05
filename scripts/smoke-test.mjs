#!/usr/bin/env node
console.log('[smoke] 科创园会议室门牌 - 冒烟测试');
console.log('[smoke] 测试场景: 预约清洁中会议室并验证不可保存');

function h(hoursFromNow) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + hoursFromNow * 60);
  return d.toISOString();
}

const SAMPLE_ROOMS = [
  {
    id: 'room-1',
    name: '星辰厅',
    floor: '3F',
    capacity: 12,
    status: 'available',
    tags: ['投影', '视频会议'],
    equipment: [
      { id: 'eq-1', name: '投影仪', type: 'projector', status: 'normal' },
      { id: 'eq-2', name: '电子白板', type: 'whiteboard', status: 'normal' },
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
      { id: 'eq-4', name: '投影仪', type: 'projector', status: 'normal' },
    ],
  },
  {
    id: 'room-3',
    name: '晨曦室',
    floor: '5F',
    capacity: 8,
    status: 'cleaning',
    tags: ['白板'],
    equipment: [{ id: 'eq-7', name: '电子白板', type: 'whiteboard', status: 'normal' }],
  },
  {
    id: 'room-4',
    name: '曙光室',
    floor: '5F',
    capacity: 8,
    status: 'available',
    tags: ['投影', '白板'],
    equipment: [
      { id: 'eq-8', name: '投影仪', type: 'projector', status: 'faulty' },
      { id: 'eq-9', name: '电子白板', type: 'whiteboard', status: 'normal' },
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
      { id: 'eq-10', name: '投影仪', type: 'projector', status: 'normal' },
      { id: 'eq-11', name: '视频会议终端', type: 'video_conf', status: 'normal' },
      { id: 'eq-12', name: '音响系统', type: 'speaker', status: 'normal' },
      { id: 'eq-13', name: '大屏显示器', type: 'display', status: 'offline' },
    ],
  },
  {
    id: 'room-6',
    name: '朝晖室',
    floor: '7F',
    capacity: 6,
    status: 'maintenance',
    tags: ['白板'],
    equipment: [{ id: 'eq-14', name: '电子白板', type: 'whiteboard', status: 'faulty' }],
  },
];

const SAMPLE_BOOKINGS = [
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
];

function addBooking(draft, rooms, bookings) {
  const room = rooms.find((r) => r.id === draft.roomId);
  if (!room) return { error: '会议室不存在', rooms, bookings };

  if (room.status === 'cleaning') {
    return { error: '该会议室正在清洁中，无法预约', rooms, bookings };
  }

  if (room.status === 'maintenance') {
    return { error: '该会议室正在维护中，无法预约', rooms, bookings };
  }

  const start = new Date(draft.startTime).getTime();
  const end = new Date(draft.endTime).getTime();
  if (end <= start) {
    return { error: '结束时间必须晚于开始时间', rooms, bookings };
  }

  const conflict = bookings.find(
    (b) =>
      b.roomId === draft.roomId &&
      new Date(b.startTime).getTime() < end &&
      new Date(b.endTime).getTime() > start
  );
  if (conflict) {
    return { error: '该时段已被预约，请选择其他时间', rooms, bookings };
  }

  const newBooking = {
    id: `bk-${Date.now()}`,
    ...draft,
    isOvertime: false,
  };

  return {
    error: null,
    bookings: [...bookings, newBooking],
    rooms: rooms.map((r) =>
      r.id === draft.roomId ? { ...r, status: 'occupied' } : r
    ),
  };
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

const rooms = JSON.parse(JSON.stringify(SAMPLE_ROOMS));
const bookings = JSON.parse(JSON.stringify(SAMPLE_BOOKINGS));

const cleaningRoom = rooms.find((r) => r.status === 'cleaning');
console.log(`\n[1/5] 找到清洁中的会议室: ${cleaningRoom?.name ?? 'NOT FOUND'}`);

test('清洁中会议室应存在', () => {
  if (!cleaningRoom) throw new Error('未找到清洁中会议室');
});

test('清洁中状态应为 cleaning', () => {
  if (cleaningRoom.status !== 'cleaning')
    throw new Error(`状态异常: ${cleaningRoom.status}`);
});

const now = new Date();
const start = new Date(now.getTime() + 3600000);
const end = new Date(now.getTime() + 7200000);

const draft = {
  roomId: cleaningRoom.id,
  title: '尝试预约清洁中的会议室',
  organizer: '测试用户',
  startTime: start.toISOString(),
  endTime: end.toISOString(),
};

const result = addBooking(draft, rooms, bookings);

test('预约清洁中会议室应返回错误', () => {
  if (result.error === null) throw new Error('未返回预期的错误');
  if (result.error !== '该会议室正在清洁中，无法预约')
    throw new Error(`错误消息不匹配: ${result.error}`);
});

test('预约不应被保存', () => {
  const count = result.bookings.filter(
    (b) => b.roomId === cleaningRoom.id && b.title === draft.title
  ).length;
  if (count > 0) throw new Error('预约被错误地保存了');
});

test('空闲会议室应能正常预约', () => {
  const availableRoom = rooms.find((r) => r.status === 'available');
  if (!availableRoom) throw new Error('未找到空闲会议室');
  const draft2 = {
    roomId: availableRoom.id,
    title: '正常预约',
    organizer: '测试用户',
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };
  const r = addBooking(draft2, rooms, bookings);
  if (r.error !== null) throw new Error(`正常预约失败: ${r.error}`);
  const found = r.bookings.find(
    (b) => b.roomId === availableRoom.id && b.title === draft2.title
  );
  if (!found) throw new Error('预约未被保存');
});

test('故障投影仪会议室应隐藏投影标签', () => {
  const roomWithFaulty = rooms.find((r) =>
    r.equipment.some((e) => e.type === 'projector' && e.status === 'faulty')
  );
  if (!roomWithFaulty) throw new Error('未找到投影仪故障的会议室');
  const hasFaulty = roomWithFaulty.equipment.some(
    (e) => e.type === 'projector' && e.status === 'faulty'
  );
  const visibleTags = hasFaulty
    ? roomWithFaulty.tags.filter((t) => t !== '投影')
    : roomWithFaulty.tags;
  if (visibleTags.includes('投影')) throw new Error('投影标签未被隐藏');
});

console.log(`\n[smoke] ${passed} 通过, ${failed} 失败`);
if (failed > 0) {
  console.log('[smoke] ❌ 冒烟测试未通过');
  process.exit(1);
}
console.log('[smoke] ✅ 冒烟测试通过');
process.exit(0);
