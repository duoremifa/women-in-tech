// src/data/works.ts
// 正在打磨的方向（四个手作方向，公益先行）。
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
}

export const WORKS: Work[] = [
  {
    slug: 'sound-field',
    titleZh: '声场 · 独立音乐人录音灌注',
    titleEn: 'Sound Field · Recording for Independent Musicians',
    taglineZh: '为有自己作品的独立音乐人，从话筒摆位到母带灌注的完整陪伴。',
    taglineEn: 'From mic placement to mastering—end-to-end care for independent musicians with original work.',
    status: 'concept',
    craftZh: '录音灌注',
    craftEn: 'Audio',
    ethosZh: '把声音当手艺——每一帧都经得起回放，不靠响度讨好耳朵。',
    ethosEn: 'Treating sound as craft—every frame holds up to replay, never flattering the ear with loudness.',
    cobuildHintZh: '一起把一首未完成的曲子，从话筒摆位打磨到母带灌注。乐手、录音、调音，谁都可以带来自己那一帧。',
    cobuildHintEn: 'Shape an unfinished track together—from mic placement to mastering. Musicians, recording, and mastering hands alike; anyone can bring their frame.',
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
    ethosZh: '不拍流水线广告，只拍配得上作品本身的画面。',
    ethosEn: 'No conveyor-belt ads—only frames worthy of the work itself.',
    cobuildHintZh: '一起为一个独立品牌或作品，从定位想到画面。导演、摄影、品牌主，谁都可以是这一帧的发起人。',
    cobuildHintEn: 'Co-shape one independent brand or work—from positioning to frame. Directors, photographers, brand owners—anyone can start the shot.',
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
    ethosZh: '把网页当器物打磨——每一行字、每一帧动效都经得起审视。',
    ethosEn: 'Polishing the web like an artifact—every line and motion frame holds up to scrutiny.',
    cobuildHintZh: '一起把一个页面或作品集，从排版打磨到动效。前端、设计、产品，谁都可以带来自己想做的那个。',
    cobuildHintEn: 'Co-build one page or portfolio—from typography to motion. Frontend, design, product—anyone can bring the one they want to make.',
  },
  {
    slug: 'circle-plays',
    titleZh: '社群 · 品牌与玩法',
    titleEn: 'Circle · Brand & Plays',
    taglineZh: '为有独立工作室的品牌，打磨具体到可执行的社群玩法。',
    taglineEn: 'Concrete, executable community plays for independent studio brands.',
    status: 'concept',
    craftZh: '品牌社群',
    craftEn: 'Brand',
    ethosZh: '不做泛社群，只为独立品牌打磨具体到能落地的玩法。',
    ethosEn: 'No generic communities—only plays concrete enough to land for one independent brand.',
    cobuildHintZh: '一起为一个独立工作室的品牌，想一个具体到能落地的玩法。品牌主、策划、运营，谁都可以带来自己社群的真实问题。',
    cobuildHintEn: 'Co-design one concrete, landable play for an independent studio brand. Brand owners, planners, operators—anyone can bring a real community problem.',
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return WORKS.find(w => w.slug === slug);
}
