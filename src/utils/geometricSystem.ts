/**
 * 几何图标系统 - 访问频次的阶段化视觉反馈
 * 持久化到 localStorage，页面刷新自动匹配阶段
 */

import { safeGet, safeSet } from './safeStorage';
import type { IconType } from '../types/geometric-icon';

export interface GeometricStage {
  icon: IconType;
  label: string;
  min: number;
  max?: number;
}

const VISIT_COUNT_KEY = 'site_visit_count';

// 访问频次阶段
const VISIT_STAGES: GeometricStage[] = [
  { icon: 'circle', label: '初识', min: 0, max: 4 },
  { icon: 'community', label: '常客', min: 5, max: 14 },
  { icon: 'science', label: '深度用户', min: 15, max: 29 },
  { icon: 'resonance', label: '忠实粉丝', min: 30 },
];

/**
 * 初始化访问计数（页面加载时调用）
 */
export function initVisitTracking(): GeometricStage | null {
  // 仅在客户端执行
  if (typeof window === 'undefined') return null;

  const currentCount = parseInt(safeGet(VISIT_COUNT_KEY) || '0', 10);
  const newCount = currentCount + 1;

  safeSet(VISIT_COUNT_KEY, newCount.toString());

  return VISIT_STAGES.find(
    s => newCount >= s.min && (s.max === undefined || newCount <= s.max)
  ) || null;
}
