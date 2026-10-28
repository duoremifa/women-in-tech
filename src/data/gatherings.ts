// src/data/gatherings.ts
// 双周交流活动单一数据源（多期、状态化、可滚动）。
// schedule 页、join 的 .ics、webcal feed、JSON-LD、邮件通知均从此取。
// 过期自动 past → /upcoming 回环区 + webcal 滚出；review* 字段支撑"相见后回环"框架。
//
// ── 维护方式（不用本地 IDE）──────────────────────────────────
// 1. 直接在 GitHub 网页编辑此文件（github.com/duoremifa/women-in-tech）：
//    点 src/data/gatherings.ts → Edit → 复制一个现有 Gathering 对象 → 改字段 → Commit。
// 2. push 后 Cloudflare 自动重建，新期次日历/排期/JSON-LD 全部同步。
// 3. .ics / webcal feed / functions/api/join.ts 都读此文件，单一源，改一处全同步。
//
// 新增一期模板（复制到 GATHERINGS 数组，改字段）：
//   {
//     id: 'coffee-2026-12-06',        // 唯一，格式 <type>-<yyyy-mm-dd>
//     type: 'coffee',                  // 'coffee' | 'english' | 'lab'
//     titleZh: '...', titleEn: '...',
//     startIso: '2026-12-06T14:30:00+08:00',  // 带时区 ISO
//     endIso:   '2026-12-06T16:00:00+08:00',
//     icsStartUtc: '20261206T063000Z',          // UTC，YYYYMMDDTHHMMSSZ
//     icsEndUtc:   '20261206T080000Z',
//     status: 'open',                 // 'open' | 'forming' | 'full' | 'past'
//     location: { type:'Place', name:'杭州线下 + 线上', addressLocality:'Hangzhou', addressCountry:'CN' },
//     descriptionZh: '...', descriptionEn: '...',
//     capacity: 5,
//   }
// 已过期后：status 改 'past'，加 reviewZh/reviewEn/reviewSlug 进回环区。
// ────────────────────────────────────────────────────────────

export type GatheringStatus = 'open' | 'forming' | 'full' | 'past' | 'cancelled';

export interface Gathering {
  id: string; // 'coffee-2026-11-08'
  type: 'coffee' | 'english' | 'lab';
  titleZh: string;
  titleEn: string;
  /** ISO 8601 带时区，用于 JSON-LD startDate/endDate */
  startIso: string;
  endIso: string;
  /** ICS DTSTART/DTEND（UTC，YYYYMMDDTHHMMSSZ） */
  icsStartUtc: string;
  icsEndUtc: string;
  status: GatheringStatus;
  location: {
    type: 'Place' | 'VirtualLocation';
    name?: string;
    url?: string;
    addressLocality?: string;
    addressCountry?: string;
  };
  descriptionZh: string;
  descriptionEn: string;
  capacity?: number;
  /** 相见后回环：回顾正文（占位待填） */
  reviewZh?: string;
  reviewEn?: string;
  /** → /reviews/[slug] 占位页 */
  reviewSlug?: string;
  /** 本期聚会录制的播客 episode id（双向联动 → /podcast/<slug>） */
  episodeSlug?: string;
}

export const GATHERINGS: Gathering[] = [
  // ── 已结束（回环区，验证相见后闭环）──
  {
    id: 'coffee-2026-10-25',
    type: 'coffee',
    titleZh: 'Coffee Chat · 工具更迭与手艺的余地',
    titleEn: 'Coffee Chat · Tool Churn and the Room for Craft',
    startIso: '2026-10-25T14:30:00+08:00',
    endIso: '2026-10-25T16:00:00+08:00',
    icsStartUtc: '20261025T063000Z',
    icsEndUtc: '20261025T080000Z',
    status: 'past',
    location: {
      type: 'Place',
      name: '杭州线下',
      addressLocality: 'Hangzhou',
      addressCountry: 'CN',
    },
    descriptionZh: '第一期 Coffee Chat。聊了工具更迭之外，手艺意味着什么。',
    descriptionEn: 'The first Coffee Chat. Explored what craft means beyond tool churn.',
    capacity: 5,
    reviewZh: '回顾整理中：本期围坐聊了"工具更迭与个人节奏的张力"。两位设计师、一位 PM、两位工程师，没有 PPT，只有咖啡和一段段从容的推敲。详细回顾与参与者匿名感言整理中。',
    reviewEn: 'Recap in progress: the circle sat around "the tension between tool churn and personal cadence." Two designers, a PM, two engineers—no slides, only coffee and quiet reflection. Detailed recap pending.',
    reviewSlug: 'coffee-2026-10-25',
  },
  // ── 即将到来 ──
  {
    id: 'coffee-2026-11-08',
    type: 'coffee',
    titleZh: 'Coffee Chat · 一杯咖啡，从容聊聊',
    titleEn: 'Coffee Chat · A Coffee, an Unhurried Talk',
    startIso: '2026-11-08T14:30:00+08:00',
    endIso: '2026-11-08T16:00:00+08:00',
    icsStartUtc: '20261108T063000Z',
    icsEndUtc: '20261108T080000Z',
    status: 'open',
    location: {
      type: 'Place',
      name: '杭州线下 + 线上连线',
      addressLocality: 'Hangzhou',
      addressCountry: 'CN',
    },
    descriptionZh: '生成式工具秒级产出界面的当下，手艺与代表作意味着什么？这一期坐下来，从容聊一段。',
    descriptionEn: 'When generative tools ship interfaces in seconds, what does craft and signature work still mean? Sit together for one talk at its own pace.',
    capacity: 5,
  },
  {
    id: 'english-2026-11-11',
    type: 'english',
    titleZh: 'Show & Tell · Walk Me Through Something You Made',
    titleEn: 'Show & Tell · Walk Me Through Something You Made',
    startIso: '2026-11-11T20:00:00+08:00',
    endIso: '2026-11-11T21:00:00+08:00',
    icsStartUtc: '20261111T120000Z',
    icsEndUtc: '20261111T130000Z',
    status: 'open',
    location: { type: 'VirtualLocation', url: 'https://wotech.space/upcoming' },
    descriptionZh: '嘉宾用 40 分钟英文讲一个界面细节、动效或代码架构，随后 Q&A。一段 Show & Tell，只讲手里那件。',
    descriptionEn: 'A guest spends 40 minutes in English on one interface detail, micro-interaction, or code architecture, followed by open Q&A. One Show & Tell—only the work at hand.',
    capacity: 6,
  },
  {
    id: 'lab-cohort-01',
    type: 'lab',
    titleZh: 'Craft Lab · 第一期作品共建',
    titleEn: 'Craft Lab · Cohort 01 Signature Build',
    startIso: '2026-11-15T10:00:00+08:00',
    endIso: '2026-11-15T12:00:00+08:00',
    icsStartUtc: '20261115T020000Z',
    icsEndUtc: '20261115T040000Z',
    status: 'forming',
    location: { type: 'VirtualLocation', url: 'https://wotech.space/works' },
    descriptionZh: '召集 2-3 位不同专长伙伴，业余时间合力做一个立得住的开源 Web 产品。间距、基线、节奏，都对齐。滚动开展，异步推敲 + 周末轻度同步。',
    descriptionEn: 'Gather 2–3 creators across complementary disciplines to build one enduring open-source web tool—baselines, spacing, rhythm all aligned. Rolling onboarding, async refinement with weekend syncs kept light.',
    capacity: 3,
  },
];

/** 活动是否已过期（结束时间早于现在）。 */
export function isGatheringPast(g: Gathering, now: Date = new Date()): boolean {
  return new Date(g.endIso).getTime() < now.getTime();
}

/** 未过期的排期（webcal feed + schedule 主列表用），按开始时间升序。
 *  cancelled 不显示（取消后从排期+日历源消失，数据保留作记录）。 */
export function upcomingGatherings(now: Date = new Date()): Gathering[] {
  return GATHERINGS.filter(g => !isGatheringPast(g, now) && g.status !== 'cancelled').sort(
    (a, b) => new Date(a.startIso).getTime() - new Date(b.startIso).getTime(),
  );
}

/** 已结束的排期（/upcoming 回环区用），按开始时间降序（最近在前）。 */
export function pastGatherings(now: Date = new Date()): Gathering[] {
  return GATHERINGS.filter(g => isGatheringPast(g, now)).sort(
    (a, b) => new Date(b.startIso).getTime() - new Date(a.startIso).getTime(),
  );
}

export function getGatheringById(id: string): Gathering | undefined {
  return GATHERINGS.find(g => g.id === id);
}

/** 主理人微信（与 join-shared 的 WECHAT_HANDLE 一致）。 */
export const WECHAT_HANDLE = 'daiminay';
