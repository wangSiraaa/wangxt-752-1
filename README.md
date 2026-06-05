# 科创园会议室门牌

基于 React 18 + Vite + TypeScript + Tailwind + Zustand 的单页应用，为科创园提供会议室门牌管理系统。

## ✨ 功能特性

- **三种角色视角**：园区租户、前台、会议室管理员
- **门牌模式**：卡片式展示，支持不同状态的视觉区分
- **预约拦截**：清洁中/维护中会议室不可预约
- **超时告警**：超时会议门牌变红闪烁 + 顶部告警条
- **设备管理**：投影故障自动隐藏标签，管理员可复查切换状态
- **本地持久化**：所有状态通过 localStorage 保存在浏览器

## 🚀 启动命令

### 开发模式

```bash
npm install
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
# 产物在 dist/ 目录
npm run preview   # 预览构建产物
```

### 容器化部署

```bash
docker build -t meeting-room .
docker run -p 8080:80 meeting-room
```

访问 http://localhost:8080

### 冒烟测试

```bash
npm run smoke
```

核心验证：**预约清洁中会议室并验证不可保存**

### 测试输出示例：

```
[smoke] 科创园会议室门牌 - 冒烟测试
[smoke] 测试场景: 预约清洁中会议室并验证不可保存

[1/5] 找到清洁中的会议室: 晨曦室
  ✅ 清洁中会议室应存在
  ✅ 清洁中状态应为 cleaning
  ✅ 预约清洁中会议室应返回错误
  ✅ 预约不应被保存
  ✅ 空闲会议室应能正常预约
  ✅ 故障投影仪会议室应隐藏投影标签

[smoke] 6 通过, 0 失败
[smoke] ✅ 冒烟测试通过
```

## 📊 样例数据

### 6个会议室（覆盖所有状态场景）

| 会议室 | 楼层 | 状态 | 特殊场景 |
|--------|------|------|---------|
| 星辰厅 | 3F | 空闲 ✅ | 正常可预约，设备齐全 |
| 银河厅 | 3F | 占用中 🔴 | 含**超时会议**「产品需求评审」已超时，门牌变红闪烁 |
| 晨曦室 | 5F | **清洁中** 🟡 | **不可预约**（核心拦截测试用例） |
| 曙光室 | 5F | 空闲 ✅ | **投影仪故障**，「投影」标签自动隐藏 |
| 旭日厅 | 7F | 占用中 🔵 | 大屏显示器离线 |
| 朝晖室 | 7F | 维护中 🔴 | 不可预约 |

### 5个预约

| 会议 | 会议室 | 状态 | 说明 |
|------|--------|------|------|
| 产品需求评审 | 银河厅 | ⚠️ 已超时 | 组织者: 张伟，已超时约 15 分钟 |
| 技术方案讨论 | 银河厅 | ⏳ 待开始 | 组织者: 李娜，1 小时后开始 |
| 全员季度汇报 | 旭日厅 | 🔵 进行中 | 组织者: 王磊 |
| 投资人路演 | 旭日厅 | ⏳ 待开始 | 组织者: 赵敏 |
| 设计走查 | 星辰厅 | ⏳ 待开始 | 组织者: 陈静 |

### 角色权限

| 功能 | 园区租户 | 前台 | 会议室管理员 |
|------|---------|------|-------------|
| 门牌总览 | ✅ | ✅ | ✅ |
| 预约会议室 | ✅ | ❌ | ❌ |
| 时段列表 | ❌ | ✅ | ✅ |
| 设备标签复查 | ❌ | ❌ | ✅ |

## 🔒 关键业务逻辑

### 1. 清洁中会议室预约拦截

**文件**：[store/useStore.ts](src/store/useStore.ts)

```typescript
if (room.status === 'cleaning') {
  return '该会议室正在清洁中，无法预约';
}
```

- 预约时检查会议室状态
- 下拉选择框中清洁中会议室置灰不可选
- 预约按钮禁用
- 显示黄色门牌 + 🧹 清洁中标识

### 2. 超时会议视觉反馈

**文件**：[components/RoomCard.tsx](src/components/RoomCard.tsx) + [components/OvertimeAlert.tsx](src/components/OvertimeAlert.tsx)

- **门牌样式**：边框变红 + 红色背景 + 2秒脉冲闪烁动画 (`animate-pulse-overtime`)
- **会议卡片**：红色背景 + 边框 + ⚠️ 图标 + 显示「已超时 X 分钟」
- **顶部告警条**：首页顶部展示所有超时会议的红色告警条
- **时段列表**：超时行整行红色背景高亮

### 3. 投影设备故障处理

**文件**：[components/RoomCard.tsx](src/components/RoomCard.tsx) + [pages/Equipment.tsx](src/pages/Equipment.tsx)

- 自动隐藏「投影」标签
- 门牌右上角显示「投影故障」角标
- 管理员页面可一键切换设备状态（正常/故障/离线）
- 状态变更立即生效（无需刷新）

## 🔍 排错线索

### 常见问题

| 现象 | 可能原因 | 排查步骤 |
|------|---------|---------|
| 页面空白白屏 | localStorage 数据损坏 | 打开浏览器控制台，查看报错；点击右上角 🔄 重置按钮 |
| 超时会议门牌不变红 | activeBooking 匹配逻辑问题 | 检查 [RoomCard.tsx 第15-19行](src/components/RoomCard.tsx#L15-L19) 的条件是否包含 `isOvertime` |
| 预约保存失败 | 校验未通过 | 打开控制台查看 `bookingError`；F12 → Application → Local Storage → 查看 store 状态 |
| 角色切换后导航不变 | 权限过滤问题 | 检查 [Header.tsx](src/components/Header.tsx) 中 `visibleNav` 过滤逻辑 |
| 样式错乱 | Tailwind 编译问题 | 清除浏览器缓存，硬刷新页面；检查 `dist/` 目录是否重新生成 |
| Docker 启动后路由 404 | SPA 路由配置问题 | 检查 `nginx.conf` 中是否有 `try_files $uri $uri/ /index.html` |
| 冒烟测试失败 | 依赖未安装 | 先运行 `npm install` 后再执行 `npm run smoke` |

### 调试技巧

1. **查看 Store 状态**：浏览器控制台输入 `window.localStorage.getItem('meeting-room-storage')`
2. **重置样例数据**：点击页面右上角 🔄 按钮，或控制台 `localStorage.removeItem('meeting-room-storage')`
3. **模拟超时**：预约一个快结束的会议，等待几分钟观察超时样式生效

## 📁 项目结构

```
src/
├── types/index.ts              # 类型定义
├── data/sample.ts             # 样例数据
├── store/useStore.ts         # Zustand 状态管理
├── components/
│   ├── Header.tsx            # 导航 + 角色切换 + 主题
│   ├── RoleSelector.tsx    # 角色切换器
│   ├── StatusBadge.tsx     # 状态徽章
│   ├── RoomCard.tsx        # 门牌卡片
│   └── OvertimeAlert.tsx   # 超时告警
├── pages/
│   ├── Home.tsx            # 门牌总览
│   ├── Booking.tsx       # 预约会议室
│   ├── Schedule.tsx      # 时段列表
│   └── Equipment.tsx     # 设备标签
└── index.css               # 样式 + 超时动画
```

## 🛠️ 技术栈

- React 18
- Vite 6
- TypeScript 5.8
- Tailwind CSS 3.4
- Zustand 5 (状态管理 + localStorage 持久化
- React Router 7
- Lucide React (图标)
