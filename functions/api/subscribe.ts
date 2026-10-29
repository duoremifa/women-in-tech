// functions/api/subscribe.ts - Cloudflare Pages Function
// 邮件订阅入口（webcal 是纯静态无需后端；邮件订阅存 Supabase subscribers 表）。
// 与 /upcoming 订阅卡 + /join 邮件订阅勾选共用。

import type { PagesContext, PagesEnv } from './types';
import { readJsonWithCap, PayloadTooLargeError } from './body';

const RATE_LIMIT_STORE = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_WINDOW = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function secureJsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': 'https://wotech.space',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Cloudflare Pages 的 _headers 对 Function 响应不生效，安全头需随响应自带
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      ...extraHeaders,
    },
  });
}

function checkIpRateLimit(ip: string): boolean {
  const safeIp = ip && ip !== 'unknown' ? ip : '__shared_anonymous_pool__';
  const now = Date.now();
  if (RATE_LIMIT_STORE.size > 1500) {
    for (const [k, v] of RATE_LIMIT_STORE.entries())
      if (v.resetAt < now) RATE_LIMIT_STORE.delete(k);
    // 硬兜底：极端情况下防 Map 无限增长挤占 isolate 内存
    if (RATE_LIMIT_STORE.size > 2000) RATE_LIMIT_STORE.clear();
  }
  const record = RATE_LIMIT_STORE.get(safeIp);
  if (!record || record.resetAt < now) {
    RATE_LIMIT_STORE.set(safeIp, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return false;
  record.count += 1;
  return true;
}

function isOriginAllowed(origin: string | null, referer: string | null, env: PagesEnv): boolean {
  const target = origin || referer;
  if (!target) return false;
  try {
    const host = new URL(target).hostname.toLowerCase();
    // 生产只放行自有域；预览 *.pages.dev 与 localhost 仅 DEV_MODE 下放行
    // （任何人都能注册同名 women-in-tech Pages 项目仿冒预览域，故 suffix 不放开）
    return (
      host === 'wotech.space' ||
      host.endsWith('.wotech.space') ||
      (Boolean(env?.DEV_MODE) &&
        (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.pages.dev')))
    );
  } catch {
    return false;
  }
}

function isValidEmailFormat(email: string): boolean {
  if (!email || email.length > 80) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    email
  );
}

export async function onRequestPost(context: PagesContext) {
  const req = context.request;
  if (Number(req.headers.get('content-length') || 0) > 2048) {
    return secureJsonResponse({ error: 'Payload too large' }, 413);
  }
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  if (!isOriginAllowed(origin, referer, context.env)) {
    return secureJsonResponse({ error: 'Forbidden' }, 403);
  }
  const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkIpRateLimit(clientIp)) {
    return secureJsonResponse({ error: 'Too many requests' }, 429, { 'Retry-After': '600' });
  }

  try {
    let data: { email?: unknown; locale?: unknown; source?: unknown };
    try {
      data = (await readJsonWithCap(req, 2048)) as {
        email?: unknown;
        locale?: unknown;
        source?: unknown;
      };
    } catch (e) {
      if (e instanceof PayloadTooLargeError) {
        return secureJsonResponse({ error: 'Payload too large' }, 413);
      }
      throw e;
    }
    const email = isValidEmailFormat(String(data.email || '').trim());
    if (!email) {
      return secureJsonResponse({ error: '请提供合法邮箱 / Valid email required' }, 400);
    }
    const locale = data.locale === 'en' ? 'en' : 'zh';
    const source =
      typeof data.source === 'string' ? String(data.source).slice(0, 40) : 'subscribe-only';

    const supabaseUrl = context.env?.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = context.env?.PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      // Supabase 未配置：静默成功（不暴露内部状态）
      return secureJsonResponse({
        success: true,
        subscribed: false,
        message: '订阅暂未生效，请稍后重试',
      });
    }

    // upsert：同 email 已存在则更新 active/locale/created_at
    const resp = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=merge-duplicates',
      },
      body: JSON.stringify({
        email,
        locale,
        source,
        notify_email: true,
        notify_calendar: true,
        active: true,
      }),
    });
    if (!resp.ok) {
      console.error(
        'Supabase subscribe insert error:',
        resp.status,
        await resp.text().catch(() => '')
      );
    }
    return secureJsonResponse({ success: true, subscribed: true, message: '已订阅' });
  } catch (err) {
    console.error('Subscribe API error:', err);
    return secureJsonResponse({ error: '订阅异常，请稍候重试' }, 500);
  }
}
