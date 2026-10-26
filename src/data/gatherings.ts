// src/data/gatherings.ts
// 双周交流活动单一数据源。SEO JSON-LD、ICS 生成、页面排期均从此取，
// 杜绝日期在多处硬编码、事件过期后结构化数据失真。

export interface Gathering {
  id: string;
  type: 'coffee' | 'english';
  nameZh: string;
  nameEn: string;
  /** ISO 8601 带时区，用于 JSON-LD startDate/endDate */
  startIso: string;
  endIso: string;
  summary: string;
  description: string;
  location: { type: 'Place' | 'VirtualLocation'; name?: string; url?: string; addressLocality?: string; addressCountry?: string };
  /** ICS DTSTART/DTEND（UTC，格式 YYYYMMDDTHHMMSSZ） */
  icsStartUtc: string;
  icsEndUtc: string;
}

export const GATHERINGS: Gathering[] = [
  {
    id: 'coffee-chat',
    type: 'coffee',
    nameZh: 'wo/men in tech · Coffee Chat（双周轻聚）',
    nameEn: 'wo/men in tech · Coffee Chat (biweekly)',
    startIso: '2026-11-08T14:30:00+08:00',
    endIso: '2026-11-08T16:00:00+08:00',
    summary: 'wo/men in tech · Coffee Chat（双周轻聚）',
    description: '3-5人双周轻聚，面对面交流作品、设计细节与近期思考。',
    location: {
      type: 'Place',
      name: '杭州线下',
      addressLocality: 'Hangzhou',
      addressCountry: 'CN',
    },
    icsStartUtc: '20261108T063000Z',
    icsEndUtc: '20261108T080000Z',
  },
  {
    id: 'show-and-tell',
    type: 'english',
    nameZh: 'wo/men in tech · Show & Tell（英文技术与设计交流）',
    nameEn: 'wo/men in tech · Show & Tell (English)',
    startIso: '2026-11-11T20:00:00+08:00',
    endIso: '2026-11-11T20:45:00+08:00',
    summary: 'wo/men in tech · Show & Tell 英文技术与设计交流',
    description: '双周周中晚间 40 分钟英文深度分享、界面细节推敲与自由试错。',
    location: { type: 'VirtualLocation', url: 'https://wotech.space/#schedule' },
    icsStartUtc: '20261111T120000Z',
    icsEndUtc: '20261111T124500Z',
  },
];

/** 活动是否已过期（结束时间早于现在）。过期则 JSON-LD 标 EventCompleted。 */
export function isGatheringPast(g: Gathering, now: Date = new Date()): boolean {
  return new Date(g.endIso).getTime() < now.getTime();
}
