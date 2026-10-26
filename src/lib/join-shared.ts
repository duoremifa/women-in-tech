// src/lib/join-shared.ts
// 表单提交闭环的共享逻辑：ICS 日历生成 + 兴趣匹配 + 校验。
// 被 functions/api/join.ts（CF Pages Function）、astro.config.mjs（dev 中间件）、
// src/pages/index.astro 与 join.astro（客户端 .ics 下载兜底）共用，杜绝逻辑分叉。

import { GATHERINGS, type Gathering } from '../data/gatherings';

/** 兴趣键 → 是否包含 Coffee Chat 席位。兼容新旧两套键（coffee / coffee_chat）。 */
export function wantsCoffeeChat(interests: string[] = []): boolean {
  return interests.includes('coffee_chat') || interests.includes('coffee') || interests.length === 0;
}

/** 兴趣键 → 是否包含 Show & Tell 英文交流席位。兼容 english / english_chat。 */
export function wantsEnglishChat(interests: string[] = []): boolean {
  return interests.includes('english_chat') || interests.includes('english') || interests.length === 0;
}

export const VALID_CRAFTS = ['design', 'product', 'engineering', 'research', 'other'] as const;
export const VALID_INTERESTS = [
  'coffee',
  'english',
  'lab',
  'view',
  'coffee_chat',
  'english_chat',
  'portfolio_building',
] as const;

/** 主理人微信（统一字段名 wechatHandle，替代旧 wechatHost/wechatContact）。 */
export const WECHAT_HANDLE = 'daiminay';

/** RFC 5322 简明无回溯正则，杜绝 ReDoS；长度上限 80。 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || email.length > 80) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    email,
  );
}

export function escapeHtml(str: unknown, maxLen = 500): string {
  if (typeof str !== 'string') return '';
  return str
    .slice(0, maxLen)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function sanitizeForWebhook(str: unknown, maxLen = 300): string {
  if (typeof str !== 'string') return '';
  return str
    .slice(0, maxLen)
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/@(everyone|channel|here|all)/gi, '@ $1')
    .trim();
}

/** 生成 .ics 日历内容（按兴趣过滤，从 gatherings 单一数据源取日期）。 */
export function generateICS(submissionId: string, name: string, interests: string[] = []): string {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const addressee = name || '同行者';

  const selected: Gathering[] = [];
  if (wantsCoffeeChat(interests)) selected.push(GATHERINGS.find(g => g.type === 'coffee')!);
  if (wantsEnglishChat(interests)) selected.push(GATHERINGS.find(g => g.type === 'english')!);

  const events = selected.map(g =>
    [
      'BEGIN:VEVENT',
      `UID:wotech-${g.type === 'coffee' ? 'coffee' : 'showtell'}-${submissionId}@wotech.space`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${g.icsStartUtc}`,
      `DTEND:${g.icsEndUtc}`,
      `SUMMARY:${g.summary}`,
      `DESCRIPTION:致 ${addressee}：\\n这是为你预留的 ${g.type === 'coffee' ? 'Coffee Chat' : 'Show & Tell'} 交流席位。\\n回执编号: #${submissionId}\\n形式：${g.description}\\n微信联络：${WECHAT_HANDLE}`,
      `LOCATION:${g.location.type === 'VirtualLocation' ? '线上视频室 (活动前发放连线)' : '杭州线下 / 线上连线'}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      `DESCRIPTION:wo/men in tech · ${g.type === 'coffee' ? 'Coffee Chat' : 'Show & Tell'} 提醒`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n'),
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//wo/men in tech//Circle Gatherings//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function getCraftLabel(craft: string): string {
  const map: Record<string, string> = {
    design: '设计 · 视觉传达 / 交互体验 (IxD)',
    product: '产品 · 逻辑推敲 / 独立孵化 (PM)',
    engineering: '工程 · 前端架构 / 独立全栈 (FE)',
    research: '研究 · 用户洞察 / 深度写作',
    other: '跨界探索 / 独立创造者',
  };
  return map[craft] || craft || '未指定';
}

export function getInterestsLabel(interests: string[] = []): string {
  const map: Record<string, string> = {
    coffee: 'Coffee Chat (双周轻聚)',
    coffee_chat: 'Coffee Chat (双周轻聚)',
    english: 'English Chat (40 min 试讲 + Q&A)',
    english_chat: 'English Chat (40 min 试讲 + Q&A)',
    lab: '作品 · Lab (慢节奏打磨代表作)',
    portfolio_building: '作品 · Lab (慢节奏打磨代表作)',
    view: '静默观察 / 先行了解',
  };
  if (!interests || interests.length === 0) return '未勾选特定项';
  return interests.map(k => map[k] || k).join('、');
}
