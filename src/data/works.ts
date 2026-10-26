// src/data/works.ts
// 正在打磨的器物（Craft Lab 候选）。当前为占位，详情页 /works/[slug] 先搭框架。

export type WorkStatus = 'concept' | 'prototype' | 'building';
export type WorkRole = 'pm' | 'ixd' | 'fe';

export interface Work {
  slug: string;
  titleZh: string;
  titleEn: string;
  taglineZh: string;
  taglineEn: string;
  status: WorkStatus;
  roles: WorkRole[];
  ethosZh: string;
  ethosEn: string;
  cobuildHintZh: string;
  cobuildHintEn: string;
}

export const WORKS: Work[] = [
  {
    slug: 'frictionlog',
    titleZh: 'FrictionLog · 宁静慢节奏感知器',
    titleEn: 'FrictionLog · Quiet Friction Sensor',
    taglineZh: '为复杂心智创造者设计的离线手写感知器物',
    taglineEn: 'A local-first reflection tool for deep creators',
    status: 'prototype',
    roles: ['ixd', 'fe'],
    ethosZh: '杜绝社交算法与点赞刺激，专注捕获未经修饰的创作卡壳与顿悟时刻。给"想得慢但想得深"的人，一个不被催逼的器物。',
    ethosEn: 'Zero social algorithms, zero engagement hooks—holding space for genuine creative friction. For those who think slowly and deeply, a tool that never rushes.',
    cobuildHintZh: '认领共建角色：PM 负责非评价体系与微顿悟闭环；IxD 负责纸感网格与金线刻痕；FE 负责 PWA 离线存储与极速响应。',
    cobuildHintEn: 'Co-build: PM owns the non-evaluative loop; IxD owns the paper-grid tactile system; FE owns PWA offline + sub-millisecond response.',
  },
  {
    slug: 'typespec',
    titleZh: 'TypeSpec · 手艺排版标尺',
    titleEn: 'TypeSpec · Typography Calliper',
    taglineZh: '网页手艺人专用的黄金分割与衬线字距排版游标',
    taglineEn: 'A modular golden-ratio typography inspection utility',
    status: 'concept',
    roles: ['ixd', 'fe'],
    ethosZh: '让中英文混排拥有如同手制书籍一般的留白韵律与行气呼吸。把排版当手艺，而非默认值。',
    ethosEn: 'Bringing bookish calm and meticulous tracking to modern web screens. Treating typography as craft, not default.',
    cobuildHintZh: 'PM 负责即开即用体验；IxD 负责模块化尺度与黄金比例游标；FE 负责纯 CSS 变量流式驱动。',
    cobuildHintEn: 'PM owns the instant-use loop; IxD owns modular scale + golden-ratio callipers; FE owns pure CSS-variable fluid driving.',
  },
  {
    slug: 'whisper-letter',
    titleZh: 'Whisper Letter · 同行极简信笺',
    titleEn: 'Whisper Letter · Peer Critique Protocol',
    taglineZh: '女性独立创造者之间的异步信笺交换协议',
    taglineEn: 'An asynchronous craft critique protocol for independent creators',
    status: 'concept',
    roles: ['pm', 'ixd'],
    ethosZh: '每次仅交换一份深度同行反馈，拒绝浮躁的信息流与客套夸奖。一封信的耐心，胜过一百条点赞。',
    ethosEn: 'Exchange one deep, sincere feedback letter at a time. The patience of one letter outweighs a hundred likes.',
    cobuildHintZh: 'PM 负责深度反馈互助闭环；IxD 负责火漆封蜡式异步折叠动效；FE 负责轻量端对端加密文本协议。',
    cobuildHintEn: 'PM owns the deep-feedback loop; IxD owns the wax-seal async folding motion; FE owns lightweight E2E text protocol.',
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return WORKS.find(w => w.slug === slug);
}
