/**
 * 渐进式 Emoji 系统 - 基于计数的阶段化视觉反馈 & 时间感知的情感化表达
 * 用途：能量状态、访问频次、记录成长、内容库成长、时间感知展示
 * 特点：持久化到 localStorage，页面刷新自动匹配阶段
 */

export interface EmojiStage {
  emoji: string;
  label: string;
  min: number;
  max?: number;
}

export interface EmojiConfig {
  key: string;
  stages: EmojiStage[];
}

// 预定义的 emoji 阶段配置
export const EMOJI_CONFIGS: Record<string, EmojiConfig> = {
  // 能量状态追踪
  energy: {
    key: 'user_energy_count',
    stages: [
      { emoji: '😴', label: '疲惫', min: 0, max: 2 },
      { emoji: '😊', label: '还好', min: 3, max: 7 },
      { emoji: '😄', label: '不错', min: 8, max: 10 },
      { emoji: '✨', label: '充满活力', min: 11 },
    ],
  },

  // 访问频次统计
  visits: {
    key: 'site_visit_count',
    stages: [
      { emoji: '🌱', label: '初识', min: 0, max: 4 },
      { emoji: '📖', label: '常客', min: 5, max: 14 },
      { emoji: '🎯', label: '深度用户', min: 15, max: 29 },
      { emoji: '🔥', label: '忠实粉丝', min: 30 },
    ],
  },

  // 留言板记录数
  messages: {
    key: 'guestbook_message_count',
    stages: [
      { emoji: '💭', label: '思考者', min: 0, max: 4 },
      { emoji: '📝', label: '记录者', min: 5, max: 14 },
      { emoji: '🗣️', label: '分享者', min: 15, max: 29 },
      { emoji: '🌟', label: '社群声音', min: 30 },
    ],
  },

  // 知识库条目数 - 这里的理念改为“探索中的光亮与陪伴”
  knowledge: {
    key: 'knowledge_items_count',
    stages: [
      { emoji: '🕯️', label: '微光', min: 0, max: 9 }, // 初入：一点点光亮
      { emoji: '🏮', label: '提灯', min: 10, max: 29 }, // 前行：温暖的指引
      { emoji: '🔥', label: '篝火', min: 30, max: 49 }, // 驻足：安顿与温暖
      { emoji: '✨', label: '星野', min: 50 }, // 辽阔：漫天的连接
    ],
  },
};

/**
 * 获取指定类型的当前 emoji 阶段
 */
export function getEmojiStage(type: keyof typeof EMOJI_CONFIGS, count?: number): EmojiStage | null {
  const config = EMOJI_CONFIGS[type];
  if (!config) return null;

  // 如果没有提供 count，从 localStorage 读取
  const actualCount = count ?? parseInt(localStorage.getItem(config.key) || '0', 10);

  // 找到匹配的阶段
  const stage = config.stages.find(
    s => actualCount >= s.min && (s.max === undefined || actualCount <= s.max)
  );

  return stage || null;
}

/**
 * 增加计数并返回新的 emoji 阶段
 */
export function incrementEmojiCount(type: keyof typeof EMOJI_CONFIGS): EmojiStage | null {
  const config = EMOJI_CONFIGS[type];
  if (!config) return null;

  const currentCount = parseInt(localStorage.getItem(config.key) || '0', 10);
  const newCount = currentCount + 1;

  localStorage.setItem(config.key, newCount.toString());

  return getEmojiStage(type, newCount);
}

/**
 * 设置计数值并返回 emoji 阶段
 */
export function setEmojiCount(type: keyof typeof EMOJI_CONFIGS, count: number): EmojiStage | null {
  const config = EMOJI_CONFIGS[type];
  if (!config) return null;

  localStorage.setItem(config.key, count.toString());

  return getEmojiStage(type, count);
}

/**
 * 获取所有类型的当前状态
 */
export function getAllEmojiStages(): Record<string, EmojiStage | null> {
  const result: Record<string, EmojiStage | null> = {};

  Object.keys(EMOJI_CONFIGS).forEach(type => {
    result[type] = getEmojiStage(type as keyof typeof EMOJI_CONFIGS);
  });

  return result;
}

/**
 * 初始化访问计数（页面加载时调用）
 */
export function initVisitTracking(): EmojiStage | null {
  return incrementEmojiCount('visits');
}

/**
 * 初始化留言板计数（基于现有消息）
 */
export function initMessageTracking(messageCount: number): EmojiStage | null {
  return setEmojiCount('messages', messageCount);
}

/**
 * 更新能量状态（基于用户选择）
 */
export function updateEnergyState(energyLevel: string): EmojiStage | null {
  const energyMap: Record<string, number> = {
    empty: 1,
    low: 4,
    good: 8,
    full: 12,
  };

  return setEmojiCount('energy', energyMap[energyLevel] || 0);
}

/**
 * 渲染 emoji 阶段组件的辅助函数
 */
export function renderEmojiBadge(stage: EmojiStage, showLabel = false): string {
  if (!stage) return '';

  return showLabel
    ? `<span class="emoji-badge" title="${stage.label}">${stage.emoji} <span class="emoji-label">${stage.label}</span></span>`
    : `<span class="emoji-badge" title="${stage.label}">${stage.emoji}</span>`;
}

/**
 * 获取进度信息（用于进度条等可视化）
 */
export function getProgressInfo(type: keyof typeof EMOJI_CONFIGS): {
  current: EmojiStage | null;
  total: number;
  progress: number; // 0-1
} {
  const config = EMOJI_CONFIGS[type];
  if (!config) return { current: null, total: 0, progress: 0 };

  const currentCount = parseInt(localStorage.getItem(config.key) || '0', 10);
  const current = getEmojiStage(type, currentCount);

  // 计算总阶段数和当前进度
  const total = config.stages.length;
  const currentIndex = current ? config.stages.indexOf(current) : -1;
  const progress = currentIndex >= 0 ? (currentIndex + 1) / total : 0;

  return { current, total, progress };
}

// ==========================================
// 2. 基于时间的 Emoji 展示逻辑 (Time-based Emoji)
// ==========================================

export function checkSpecialDate(date: Date): boolean {
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();
  const dateStr = `${month}-${day}`;

  const specialDates = [
    '1-1', // 元旦
    '2-14', // 情人节
    '12-25', // 圣诞节
  ];

  return specialDates.includes(dateStr);
}

export function getDisplayEmoji(timestamp?: Date | string): string {
  const emojiCategories: Record<string, string[]> = {
    morning: ['🌞', '☀️', '🌅', '🍳', '☕'],
    afternoon: ['🌤️', '🏃', '💼', '📚', '🎧'],
    evening: ['🌙', '🌆', '🍽️', '🎬', '🛋️'],
    night: ['🌚', '🌠', '🦉', '🌜', '💤'],
    special: ['🎉', '🎊', '🎂', '❤️', '✨'], // 特殊日期
  };

  const now = timestamp ? new Date(timestamp) : new Date();
  const hour = now.getHours();

  let category: string;
  if (hour >= 5 && hour < 12) category = 'morning';
  else if (hour >= 12 && hour < 17) category = 'afternoon';
  else if (hour >= 17 && hour < 22) category = 'evening';
  else category = 'night';

  // 特殊日期处理
  const isSpecial = checkSpecialDate(now);
  if (isSpecial) category = 'special';

  const pool = emojiCategories[category];
  // 简单随机选择
  return pool[Math.floor(Math.random() * pool.length)];
}
