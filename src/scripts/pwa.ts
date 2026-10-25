// pwa.ts - PWA Service Worker 注册管理
// 统一管理 PWA 功能

import { registerSW } from 'virtual:pwa-register';

export function registerPWA() {
  registerSW({
    onNeedRefresh() {
      if (import.meta.env.DEV)
        console.log('New content available, click on reload button to update.');
    },
    onOfflineReady() {
      if (import.meta.env.DEV) console.log('App ready to work offline');
    },
  });
}
