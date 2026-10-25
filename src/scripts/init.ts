// init.ts - 系统初始化管理
// 统一管理所有系统初始化功能

import { Monitor } from '../utils/monitoring';
import { initVisitTracking, migrateFromEmojiSystem } from '../utils/geometricSystem';
import { fontManager } from '../utils/fontManager';

export function initializeApp() {
  Monitor.init();
  initVisitTracking();
  migrateFromEmojiSystem();
  if (import.meta.env.DEV) fontManager.init().catch(console.error);
  else fontManager.init().catch(() => {});
}
