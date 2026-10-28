// src/data/works.ts
// 正在打磨的方向（四个手作方向，每个在等第一个打样项目）。
// 每个方向在找第一个打样项目，其他人可选择加入共建。
// 详情页 /works/[slug] 先搭框架，等真实打样项目落地再补原型与图。

export type WorkStatus = 'concept' | 'prototype' | 'building';

export interface Work {
  slug: string;
  titleZh: string;
  titleEn: string;
  taglineZh: string;
  taglineEn: string;
  status: WorkStatus;
  /** 手作方向分类标签（替代原 tech-only roles 枚举） */
  craftZh: string;
  craftEn: string;
  ethosZh: string;
  ethosEn: string;
  cobuildHintZh: string;
  cobuildHintEn: string;
  /** 可选：打样作品截图/封面，路径如 /works/sound-field.jpg（放 public/works/）。留空则不渲染。 */
  cover?: string;
  /** 可选：在线 demo 链接（成品可访问时填）。留空则不渲染"去看看这件"按钮。 */
  demoUrl?: string;
}

export const WORKS: Work[] = [
  {
    slug: 'sound-field',
    titleZh: '声场 · 独立音乐人录音灌注',
    titleEn: 'Sound Field · Recording for Independent Musicians',
    taglineZh: '为有自己作品的独立音乐人，从话筒摆位到母带灌注的完整陪伴。',
    taglineEn:
      'From mic placement to mastering—end-to-end care for independent musicians with original work.',
    status: 'concept',
    craftZh: '录音灌注',
    craftEn: 'Audio',
    ethosZh: '录一首曲，从话筒到母带。',
    ethosEn: 'Record a track, from mic to master.',
    cobuildHintZh:
      '一起把一首未完成的曲子，从话筒摆位做到母带灌注。乐手带来曲子，录音与调音带来频段。',
    cobuildHintEn:
      'Shape an unfinished track together—from mic placement to mastering. Musicians bring the track, recording and mastering hands bring the frequencies.',
  },
  {
    slug: 'on-set',
    titleZh: '现场 · 拍摄与定位',
    titleEn: 'On Set · Shooting & Positioning',
    taglineZh: '为独立品牌与作品，从定位到画面的拍摄宣传。',
    taglineEn: 'From positioning to frame—shooting and promotion for independent brands and works.',
    status: 'concept',
    craftZh: '拍摄宣传',
    craftEn: 'Visual',
    ethosZh: '拍一个品牌或作品，从定位到画面。',
    ethosEn: 'Shoot a brand or work, from positioning to frame.',
    cobuildHintZh:
      '一起为一个独立品牌或作品，从定位做到画面。导演定调，摄影取景，品牌主带来要拍的那件。',
    cobuildHintEn:
      'Co-shape one independent brand or work—from positioning to frame. Directors set the tone, photographers take the frame, brand owners bring what gets shot.',
  },
  {
    slug: 'web-craft',
    titleZh: '网页 · 手作页面与作品集',
    titleEn: 'Web · Hand-made Pages & Portfolios',
    taglineZh: '为独立创造者做页面、做产品、做自己的网页作品集。',
    taglineEn: 'Pages, products, and portfolio sites for independent creators.',
    status: 'concept',
    craftZh: '网页手作',
    craftEn: 'Web',
    ethosZh: '做一个页面或作品集。',
    ethosEn: 'Make a page or portfolio.',
    cobuildHintZh: '一起把一个页面或作品集，从排版做到动效。前端搭骨，设计定调，产品想清逻辑。',
    cobuildHintEn:
      'Co-build one page or portfolio—from typography to motion. Frontend lays the bones, design sets the tone, product thinks the logic.',
  },
  {
    slug: 'circle-plays',
    titleZh: '社群 · 品牌与玩法',
    titleEn: 'Circle · Brand & Plays',
    taglineZh: '为一家独立工作室的品牌，想一个落得了地的玩法。',
    taglineEn: 'A landable play for one independent studio brand.',
    status: 'concept',
    craftZh: '品牌社群',
    craftEn: 'Brand',
    ethosZh: '为一个品牌，想一个能落地的玩法。',
    ethosEn: 'For one brand, a play that lands.',
    cobuildHintZh:
      '一起为一家独立工作室的品牌，想一个落得了地的玩法。品牌主带来社群，策划与运营把它做成。',
    cobuildHintEn:
      'Co-design one landable play for an independent studio brand. Brand owners bring the community, planners and operators make it happen.',
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return WORKS.find(w => w.slug === slug);
}
