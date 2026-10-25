// theme.ts - 主题管理脚本（纯逻辑，幂等操作）
// 负责：主题应用、切换、存储读取（不涉及DOM事件绑定）

export function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  const isDark = theme === 'dark';

  // 应用主题类
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);

  // 存储用户选择
  localStorage.setItem('theme', theme);

  // 更新 theme-color meta
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-surface-primary')
    .trim();
  if (themeColorMeta && bgColor) {
    themeColorMeta.setAttribute('content', bgColor);
  }

  // 深色模式下添加背景纹理
  if (isDark) {
    root.style.backgroundImage = 'var(--texture-paper-dark)';
  } else {
    root.style.backgroundImage = 'var(--texture-paper-light)';
  }

  // 实验性主题支持
  applyExperimentalTheme();
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  applyTheme(isDark ? 'light' : 'dark');
}

export function applyStoredTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else {
    // 跟随系统主题
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(systemDark ? 'dark' : 'light');
  }
}

export function applySystemTheme(theme: 'light' | 'dark') {
  // 仅在没有用户偏好时应用系统主题
  if (!localStorage.getItem('theme')) {
    applyTheme(theme);
  }
}

export function applyExperimentalTheme() {
  try {
    const params = new URLSearchParams(window.location.search);
    const expTheme = params.get('theme') || sessionStorage.getItem('experimental-theme');
    if (expTheme) {
      sessionStorage.setItem('experimental-theme', expTheme);
      document.documentElement.setAttribute('data-theme', expTheme);
    }
  } catch (e) {
    if (import.meta.env.DEV) console.error('Theme experiment error:', e);
  }
}
