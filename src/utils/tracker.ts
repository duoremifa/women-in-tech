/**
 * SimpleTracker - 极简访问追踪工具
 *
 * 用于追踪用户访问次数，并根据访问频率提供不同的标签。
 * 数据存储在 localStorage 中,纯前端实现。
 *
 * @example
 * ```typescript
 * import { SimpleTracker } from '../utils/tracker'
 *
 * // 初始化追踪（通常在 DOMContentLoaded 时）
 * const tracker = new SimpleTracker()
 * tracker.updateUI('visitCount', 'visitStage')
 * ```
 */

export class SimpleTracker {
  private storageKey: string;

  constructor(storageKey = 'frictionlog_visits') {
    this.storageKey = storageKey;
  }

  /**
   * 获取当前访问次数
   * @returns 访问次数
   */
  getVisitCount(): number {
    const visits = localStorage.getItem(this.storageKey);
    return visits ? parseInt(visits, 10) : 0;
  }

  /**
   * 增加访问次数
   * @returns 新的访问次数
   */
  incrementVisit(): number {
    const currentCount = this.getVisitCount();
    const newCount = currentCount + 1;
    localStorage.setItem(this.storageKey, newCount.toString());
    return newCount;
  }

  /**
   * 根据访问次数获取阶段标签
   * @param count 访问次数
   * @returns 阶段标签
   */
  getStageLabel(count: number): string {
    if (count <= 3) return '初访';
    if (count <= 10) return '再访';
    if (count <= 30) return '常访';
    return '深访';
  }

  /**
   * 根据访问次数获取阶段颜色
   * @param count 访问次数
   * @returns CSS 颜色变量
   */
  getStageColor(count: number): string {
    if (count <= 3) return 'var(--color-text-tertiary)';
    if (count <= 10) return 'var(--color-text-secondary)';
    if (count <= 30) return 'var(--color-text-primary)';
    return 'var(--color-primary-600)';
  }

  /**
   * 更新页面 UI 元素
   * @param countElementId 显示访问次数的元素 ID
   * @param stageElementId 显示访问阶段的元素 ID
   */
  updateUI(countElementId: string, stageElementId: string): void {
    const visitCount = this.incrementVisit();

    // 更新访问次数
    const countEl = document.getElementById(countElementId);
    if (countEl) {
      countEl.textContent = visitCount.toString();
    }

    // 更新访问阶段
    const stageEl = document.getElementById(stageElementId);
    if (stageEl) {
      stageEl.textContent = this.getStageLabel(visitCount);
      stageEl.style.color = this.getStageColor(visitCount);
    }
  }

  /**
   * 重置访问计数
   */
  reset(): void {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * 创建并初始化一个默认追踪器实例
 * 这是一个便捷函数，用于快速初始化
 */
export function initTracker(countElementId = 'visitCount', stageElementId = 'visitStage'): void {
  const tracker = new SimpleTracker();
  tracker.updateUI(countElementId, stageElementId);
}
