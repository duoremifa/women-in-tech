# 日程管理指南 · wotech.space

所有排期都在 `src/data/gatherings.ts` 这一个文件里。改它，全站（排期页 / 日历源 / .ics / 邮件 / JSON-LD）自动同步。

**不用本地 IDE**——直接在 GitHub 网页编辑：打开 [src/data/gatherings.ts](https://github.com/duoremifa/women-in-tech/blob/main/src/data/gatherings.ts) → 右上铅笔 ✏️ → 改 → Commit changes。push 后 Cloudflare 自动重建，约 1 分钟上线。

---

## 五种状态

| status | 含义 | 排期页显示 | 日历源(.ics/webcal) | RSVP |
|---|---|---|---|---|
| `open` | 还能报名 | ✅ 显示，"还能报名" | ✅ 包含 | ✅ 显示 |
| `forming` | 小组筹备中 | ✅ 显示，"小组筹备中" | ✅ 包含 | ✅ 显示（共建意向） |
| `full` | 已满 | ✅ 显示，"已满" | ✅ 包含 | ❌ 隐藏，提示等下期 |
| `past` | 已结束 | 移到"已结束 + 回顾"区 | ❌ 滚出 | ❌ |
| `cancelled` | 取消 | ❅ 不显示（从排期消失） | ❅ 滚出 | ❌ |

---

## 常见操作

### 1. 取消一期
找到那期的对象，把 `status` 改成 `'cancelled'`：
```ts
{
  id: 'coffee-2026-11-08',
  ...
  status: 'cancelled',   // 原来是 'open'
}
```
提交即可。该期从排期页 + 日历源消失，已订阅的人日历里这条会自动撤掉。数据保留在文件里作记录。

### 2. 改时间 / 改地点
找到那期，改 `startIso` / `endIso`（带时区 ISO）+ `icsStartUtc` / `icsEndUtc`（UTC）：
```ts
{
  id: 'coffee-2026-11-08',
  startIso: '2026-11-15T14:30:00+08:00',   // 改这里
  endIso:   '2026-11-15T16:00:00+08:00',
  icsStartUtc: '20261115T063000Z',          // UTC = 北京时间 -8h
  icsEndUtc:   '20261115T080000Z',
  ...
}
```
**时区换算**：北京时间 `14:30` → UTC `06:30`（减 8 小时）→ `20261115T063000Z`。
地点改 `location` 对象（`type: 'Place'` 线下 / `type: 'VirtualLocation'` 线上）。

提交后，已订阅日历的人那边时间会自动更新（webcal 是订阅源，不是一次性下载）。

### 3. 报满 / 关闭报名
```ts
status: 'full',   // 原来是 'open'
```
排期页显示"已满"，RSVP 按钮隐藏，提示订阅日历源等下期。

### 4. 一期结束后 → 回顾
时间过了之后，把 `status` 改 `'past'`，并加回顾字段（可选）：
```ts
{
  id: 'coffee-2026-10-25',
  status: 'past',
  reviewZh: '回顾整理中：本期围坐聊了……（一段话）',
  reviewEn: 'Recap in progress: ...',
  reviewSlug: 'coffee-2026-10-25',   // → /reviews/<slug> 占位页
}
```
该期移到 /upcoming 底部"已结束 + 回顾"区，日历源滚出。

### 5. 新增一期
复制一个现有 Gathering 对象，改字段：
```ts
{
  id: 'coffee-2026-12-06',                 // 唯一，格式 <type>-<yyyy-mm-dd>
  type: 'coffee',                           // 'coffee' | 'english' | 'lab'
  titleZh: 'Coffee Chat · 一杯咖啡，从容聊聊',
  titleEn: 'Coffee Chat · A Coffee, an Unhurried Talk',
  startIso: '2026-12-06T14:30:00+08:00',
  endIso:   '2026-12-06T16:00:00+08:00',
  icsStartUtc: '20261206T063000Z',
  icsEndUtc:   '20261206T080000Z',
  status: 'open',
  location: { type: 'Place', name: '杭州线下 + 线上连线', addressLocality: 'Hangzhou', addressCountry: 'CN' },
  descriptionZh: '…',
  descriptionEn: '…',
  capacity: 5,
},
```
加到 `GATHERINGS` 数组里，提交。

### 6. 关联播客（双向）
如果这期聚会录了播客：
```ts
episodeSlug: 'ep-01-linda',   // → 该期排期页显示"本期录制 ↗"链接到 /podcast/ep-01-linda
```
播客那边 `src/content/podcast/ep-01-linda.md` frontmatter 加 `gatheringId: 'coffee-2026-12-06'`（反向链接）。

---

## 字段速查

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 唯一，`<type>-<yyyy-mm-dd>` |
| `type` | ✅ | `coffee` / `english` / `lab` |
| `titleZh` / `titleEn` | ✅ | 标题 |
| `startIso` / `endIso` | ✅ | 带时区 ISO（`+08:00`） |
| `icsStartUtc` / `icsEndUtc` | ✅ | UTC，`YYYYMMDDTHHMMSSZ` |
| `status` | ✅ | 见上表 |
| `location` | ✅ | `Place`（线下）/ `VirtualLocation`（线上） |
| `descriptionZh` / `descriptionEn` | ✅ | 一段描述 |
| `capacity` |   | 人数，如 5 |
| `reviewZh` / `reviewEn` / `reviewSlug` |   | 仅 `past` 时填 |
| `episodeSlug` |   | 关联播客 |

---

## 时区换算小抄

北京时间 → UTC（减 8 小时）：
- 09:00 → 01:00
- 14:30 → 06:30
- 20:00 → 12:00

ISO 模板：`2026-12-06T14:30:00+08:00` → ICS `20261206T063000Z`

---

## 验证

改完 push，等 CF 重建（~1 分钟），看：
- `/upcoming` 排期页是否正确显示/隐藏
- 订阅了日历源的人，日历 App 里是否同步（webcal 订阅是自动更新，不是重新下载）
- 如有问题，本地 `npm run dev` 预览
