// src/utils/safeStorage.ts
// localStorage 的安全访问包装。
// Safari 隐私模式、storage 被禁用或 quota 超限时裸调用会抛错，
// 这里统一 try/catch 回退，避免未处理异常中断应用逻辑。

export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 静默回退 */
  }
}
