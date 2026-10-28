// Cloudflare Pages Function 上下文的最小类型
// 项目未引入 @cloudflare/workers-types（其全局类型会与 @types/node/Astro 冲突），
// 故在此定义实际用到的那部分 env + context 形状，取代 any。

export interface PagesEnv {
  ADMIN_TOKEN?: string;
  DEV_MODE?: string;
  EMAIL_FROM?: string;
  JOIN_WEBHOOK_URL?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
  PUBLIC_SUPABASE_URL?: string;
  RESEND_API_KEY?: string;
  SENDGRID_API_KEY?: string;
  SENDGRID_FROM?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  // Cloudflare 环境变量可任意扩展，宽容未显式列出的键
  [key: string]: string | undefined;
}

export interface PagesContext {
  request: Request;
  env: PagesEnv;
  waitUntil(promise: Promise<unknown>): void;
  next(): Promise<Response>;
}
