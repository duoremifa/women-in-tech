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

export type GatheringStatus = 'open' | 'forming' | 'full' | 'past';

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
    titleZh: 'Coffee Chat · 当工具不再定义我们',
    titleEn: 'Coffee Chat · When Tools No Longer Define Us',
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
    descriptionZh: '第一期 Coffee Chat。我们聊了在工具焦虑之外，"手艺"对每个人意味着什么。',
    descriptionEn: 'Our first Coffee Chat. We explored what "craft" means to each of us beyond tool anxiety.',
    capacity: 5,
    reviewZh: '回顾整理中：本期我们围坐聊了"工具更迭与个人节奏的张力"。两位设计师、一位 PM、两位工程师，没有 PPT，只有咖啡和一段段未经修饰的推敲。详细回顾与参与者匿名感言整理中。',
    reviewEn: 'Recap in progress: we sat around discussing "the tension between tool churn and personal cadence." Two designers, a PM, two engineers—no slides, only coffee and unvarnished reflection. Detailed recap pending.',
    reviewSlug: 'coffee-2026-10-25',
  },
  // ── 即将到来 ──
  {
    id: 'coffee-2026-11-08',
    type: 'coffee',
    titleZh: 'Coffee Chat · AI 时代，还剩下什么是属于自己的？',
    titleEn: 'Coffee Chat · In the Age of AI, What Truly Remains Ours?',
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
    descriptionZh: '当生成式代码和模板能够秒级产出界面，我们对于"手艺"与"代表作"的定义正在发生怎样的变化？这一期我们坐下来，聊聊如何从工业流水线的焦虑中抽离，重新发现具有个人辨识度的表达。',
    descriptionEn: 'As generative models output boilerplate interfaces in seconds, how are our definitions of personal craft and signature artifacts evolving? Let us sit together and step back from industrial anxiety to uncover distinct personal voice.',
    capacity: 5,
  },
  {
    id: 'english-2026-11-11',
    type: 'english',
    titleZh: 'Show & Tell · Walk Me Through Something You Made',
    titleEn: 'Show & Tell · Walk Me Through Something You Made',
    startIso: '2026-11-11T20:00:00+08:00',
    endIso: '2026-11-11T20:45:00+08:00',
    icsStartUtc: '20261111T120000Z',
    icsEndUtc: '20261111T124500Z',
    status: 'open',
    location: { type: 'VirtualLocation', url: 'https://wotech.space/upcoming' },
    descriptionZh: '特邀分享嘉宾用 40 分钟英文讲述一个深有体会的界面细节、动效或代码架构。在安全宽容的交流语境里，设有充裕的 Q&A 互动环节，帮助大家跨越开口焦虑，迈出全球化表达的第一步。',
    descriptionEn: 'Featuring a guest speaker sharing a favorite interface detail, micro-interaction, or code architecture in English for 40 minutes, followed by an open Q&A session in a supportive, relaxed setting.',
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
    descriptionZh: '召集 2-3 位不同专长伙伴，利用业余时间合力完成一个真正具有收藏质感与实用价值的开源 Web 产品。拒绝粗糙玩具，把每一处间距与基线对齐做到极致。滚动开展，异步推敲 + 周末轻度同步。',
    descriptionEn: 'Gathering 2–3 creators across complementary disciplines to collaboratively build an enduring, refined open-source digital tool. Honoring craftsmanship at every scale. Rolling onboarding, async refinement with gentle weekend touchpoints.',
    capacity: 3,
  },
];

/** 活动是否已过期（结束时间早于现在）。 */
export function isGatheringPast(g: Gathering, now: Date = new Date()): boolean {
  return new Date(g.endIso).getTime() < now.getTime();
}

/** 未过期的排期（webcal feed + schedule 主列表用），按开始时间升序。 */
export function upcomingGatherings(now: Date = new Date()): Gathering[] {
  return GATHERINGS.filter(g => !isGatheringPast(g, now)).sort(
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
