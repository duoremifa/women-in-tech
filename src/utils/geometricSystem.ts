/**
 * 几何图标系统 - 基于计数的阶段化视觉反馈 & 时间感知的理性化表达
 * 用途：能量状态、访问频次、记录成长、内容库成长、时间感知展示
 * 特点：持久化到 localStorage，页面刷新自动匹配阶段，矢量图标，可定制动画
 */

export type IconType =
  | 'resonance'
  | 'science'
  | 'growth'
  | 'version'
  | 'community'
  | 'footprint'
  | 'intersect'
  | 'circle'
  | 'line'
  | 'start'
  | 'box'
  | 'people'
  | 'steps'
  | 'write'
  | 'heart'
  | 'like'
  | 'bless';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'primary' | 'secondary' | 'text' | 'current';
export type AnimationType = 'pulse' | 'breathe' | 'rotate' | 'none';

export interface GeometricStage {
  icon: IconType;
  label: string;
  min: number;
  max?: number;
  config: {
    size: IconSize;
    color: IconColor;
    animated: boolean;
    animationType?: AnimationType;
    intensity?: number; // 视觉强度 0-1
  };
}

export interface GeometricConfig {
  key: string;
  stages: GeometricStage[];
}

// 预定义的几何图标阶段配置
export const GEOMETRIC_CONFIGS: Record<string, GeometricConfig> = {
  // 能量状态追踪
  energy: {
    key: 'user_energy_count',
    stages: [
      {
        icon: 'circle',
        label: '疲惫',
        min: 0,
        max: 2,
        config: { size: 'xs', color: 'text', animated: false, intensity: 0.3 },
      },
      {
        icon: 'circle',
        label: '还好',
        min: 3,
        max: 7,
        config: { size: 'sm', color: 'secondary', animated: false, intensity: 0.6 },
      },
      {
        icon: 'growth',
        label: '不错',
        min: 8,
        max: 10,
        config: {
          size: 'md',
          color: 'primary',
          animated: true,
          animationType: 'breathe',
          intensity: 0.8,
        },
      },
      {
        icon: 'resonance',
        label: '充满活力',
        min: 11,
        config: {
          size: 'lg',
          color: 'primary',
          animated: true,
          animationType: 'pulse',
          intensity: 1.0,
        },
      },
    ],
  },

  // 访问频次统计
  visits: {
    key: 'site_visit_count',
    stages: [
      {
        icon: 'circle',
        label: '初识',
        min: 0,
        max: 4,
        config: { size: 'xs', color: 'secondary', animated: false, intensity: 0.4 },
      },
      {
        icon: 'community',
        label: '常客',
        min: 5,
        max: 14,
        config: { size: 'sm', color: 'primary', animated: false, intensity: 0.6 },
      },
      {
        icon: 'science',
        label: '深度用户',
        min: 15,
        max: 29,
        config: {
          size: 'md',
          color: 'primary',
          animated: true,
          animationType: 'rotate',
          intensity: 0.8,
        },
      },
      {
        icon: 'resonance',
        label: '忠实粉丝',
        min: 30,
        config: {
          size: 'lg',
          color: 'primary',
          animated: true,
          animationType: 'pulse',
          intensity: 1.0,
        },
      },
    ],
  },

  // 留言板记录数
  messages: {
    key: 'guestbook_message_count',
    stages: [
      {
        icon: 'circle',
        label: '思考者',
        min: 0,
        max: 4,
        config: { size: 'xs', color: 'text', animated: false, intensity: 0.4 },
      },
      {
        icon: 'write',
        label: '记录者',
        min: 5,
        max: 14,
        config: { size: 'sm', color: 'secondary', animated: false, intensity: 0.6 },
      },
      {
        icon: 'people',
        label: '分享者',
        min: 15,
        max: 29,
        config: {
          size: 'md',
          color: 'primary',
          animated: true,
          animationType: 'breathe',
          intensity: 0.8,
        },
      },
      {
        icon: 'community',
        label: '社群声音',
        min: 30,
        config: {
          size: 'lg',
          color: 'primary',
          animated: true,
          animationType: 'pulse',
          intensity: 1.0,
        },
      },
    ],
  },

  // 知识库条目数 - 探索中的光亮与陪伴
  knowledge: {
    key: 'knowledge_items_count',
    stages: [
      {
        icon: 'circle',
        label: '微光',
        min: 0,
        max: 9,
        config: { size: 'xs', color: 'text', animated: false, intensity: 0.3 },
      },
      {
        icon: 'line',
        label: '提灯',
        min: 10,
        max: 29,
        config: {
          size: 'sm',
          color: 'secondary',
          animated: true,
          animationType: 'breathe',
          intensity: 0.6,
        },
      },
      {
        icon: 'growth',
        label: '篝火',
        min: 30,
        max: 49,
        config: {
          size: 'md',
          color: 'primary',
          animated: true,
          animationType: 'pulse',
          intensity: 0.8,
        },
      },
      {
        icon: 'resonance',
        label: '星野',
        min: 50,
        config: {
          size: 'lg',
          color: 'primary',
          animated: true,
          animationType: 'pulse',
          intensity: 1.0,
        },
      },
    ],
  },
};

/**
 * 获取指定类型的当前几何图标阶段
 */
export function getGeometricStage(
  type: keyof typeof GEOMETRIC_CONFIGS,
  count?: number
): GeometricStage | null {
  const config = GEOMETRIC_CONFIGS[type];
  if (!config) return null;

  // 如果没有提供 count，从 localStorage 读取（仅在客户端）
  let actualCount = count;
  if (actualCount === undefined && typeof window !== 'undefined') {
    actualCount = parseInt(localStorage.getItem(config.key) || '0', 10);
  } else if (actualCount === undefined) {
    actualCount = 0;
  }

  // 找到匹配的阶段
  const stage = config.stages.find(
    s => actualCount >= s.min && (s.max === undefined || actualCount <= s.max)
  );

  return stage || null;
}

/**
 * 增加计数并返回新的几何图标阶段
 */
export function incrementGeometricCount(
  type: keyof typeof GEOMETRIC_CONFIGS
): GeometricStage | null {
  const config = GEOMETRIC_CONFIGS[type];
  if (!config) return null;

  // 仅在客户端执行
  if (typeof window === 'undefined') return null;

  const currentCount = parseInt(localStorage.getItem(config.key) || '0', 10);
  const newCount = currentCount + 1;

  localStorage.setItem(config.key, newCount.toString());

  return getGeometricStage(type, newCount);
}

/**
 * 设置计数值并返回几何图标阶段
 */
export function setGeometricCount(
  type: keyof typeof GEOMETRIC_CONFIGS,
  count: number
): GeometricStage | null {
  const config = GEOMETRIC_CONFIGS[type];
  if (!config) return null;

  // 仅在客户端执行
  if (typeof window === 'undefined') return getGeometricStage(type, count);

  localStorage.setItem(config.key, count.toString());

  return getGeometricStage(type, count);
}

/**
 * 获取所有类型的当前状态
 */
export function getAllGeometricStages(): Record<string, GeometricStage | null> {
  const result: Record<string, GeometricStage | null> = {};

  Object.keys(GEOMETRIC_CONFIGS).forEach(type => {
    result[type] = getGeometricStage(type as keyof typeof GEOMETRIC_CONFIGS);
  });

  return result;
}

/**
 * 初始化访问计数（页面加载时调用）
 */
export function initVisitTracking(): GeometricStage | null {
  // 仅在客户端执行
  if (typeof window === 'undefined') return null;
  return incrementGeometricCount('visits');
}

/**
 * 初始化留言板计数（基于现有消息）
 */
export function initMessageTracking(messageCount: number): GeometricStage | null {
  return setGeometricCount('messages', messageCount);
}

/**
 * 更新能量状态（用户手动设置）
 */
export function updateEnergyState(level: number): GeometricStage | null {
  return setGeometricCount('energy', level);
}

/**
 * 更新知识库计数
 */
export function updateKnowledgeCount(count: number): GeometricStage | null {
  return setGeometricCount('knowledge', count);
}

/**
 * 兼容性：从 emoji 系统迁移的辅助函数
 */
export function getGeometricIconClasses(stage: GeometricStage): string {
  const { icon, config } = stage;
  const classes = [`geom-icon-${icon}`];

  classes.push(`size-${config.size}`);
  classes.push(`color-${config.color}`);

  if (config.animated && config.animationType) {
    classes.push(`animate-${config.animationType}`);
  }

  if (config.intensity) {
    classes.push(`intensity-${Math.round(config.intensity * 10)}`);
  }

  return classes.join(' ');
}

/**
 * 兼容性：从 emoji 系统迁移的辅助函数
 */
export function migrateFromEmojiSystem() {
  // 这里可以添加从旧 emoji 系统迁移数据的逻辑
  // 例如：读取旧的 localStorage 键并转换为新格式
  // 暂时保留函数结构以备将来使用
  console.log('Migration function ready for future implementation');
}
