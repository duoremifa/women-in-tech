// init.ts - 系统初始化管理
// 统一管理所有系统初始化功能

import { Monitor } from '../utils/monitoring';
import { initVisitTracking } from '../utils/geometricSystem';

export function initializeApp() {
  Monitor.init();
  initVisitTracking();
}
