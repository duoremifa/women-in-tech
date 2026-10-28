// functions/api/notify.ts - Cloudflare Pages Function
// 新排期上线时，向邮件订阅者批量发送通知（一期就配，流量小）。
// 需 admin token（ADMIN_TOKEN env）+ service_role key（SUPABASE_SERVICE_ROLE_KEY env）。
// 触发方式：rebuild 后手动 curl，或 CI 在新排期 deploy 后调用。

import type { PagesContext } from './types';
import { readJsonWithCap, PayloadTooLargeError } from './body';

interface Subscriber {
  email: string;
  locale: string;
}

// admin 接口 IP 限流（防 token 时序爆破与重放刷配额）。edge 跨 isolate 不可靠，
// 真正的限流靠 CF WAF（见 docs/SECURITY_CF_HARDENING.md）；此为纵深防御。
const NOTIFY_RATE_STORE = new Map<string, { count: number; resetAt: number }>();
const NOTIFY_MAX_PER_HOUR = 5;
const NOTIFY_WINDOW_MS = 60 * 60 * 1000;

function checkNotifyRateLimit(ip: string): boolean {
  const safeIp = ip && ip !== 'unknown' ? ip : '__anon__';
  const now = Date.now();
  if (NOTIFY_RATE_STORE.size > 200) {
    for (const [k, v] of NOTIFY_RATE_STORE.entries())
      if (v.resetAt < now) NOTIFY_RATE_STORE.delete(k);
    if (NOTIFY_RATE_STORE.size > 300) NOTIFY_RATE_STORE.clear();
  }
  const rec = NOTIFY_RATE_STORE.get(safeIp);
  if (!rec || rec.resetAt < now) {
    NOTIFY_RATE_STORE.set(safeIp, { count: 1, resetAt: now + NOTIFY_WINDOW_MS });
    return true;
  }
  if (rec.count >= NOTIFY_MAX_PER_HOUR) return false;
  rec.count += 1;
  return true;
}

// 恒定时间字符串比较 —— 防 admin token 时序侧信道（Workerd 无 crypto.timingSafeEqual）
function ctEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function onRequestPost(context: PagesContext) {
  const req = context.request;

  // body 硬顶（admin 调用体很小，4096 足够）
  if (Number(req.headers.get('content-length') || 0) > 4096) {
    return new Response(JSON.stringify({ error: 'Payload Too Large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // IP 限流（防爆破）
  const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkNotifyRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '3600' },
    });
  }

  // 恒定时间 token 校验
  const adminToken = context.env?.ADMIN_TOKEN;
  const sentToken = req.headers.get('x-admin-token') || '';
  if (!adminToken || !ctEqual(sentToken, adminToken)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = context.env?.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = context.env?.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = context.env?.RESEND_API_KEY;
  const emailFrom = context.env?.EMAIL_FROM || 'wo/men in tech <onboarding@resend.dev>';

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return new Response(
      JSON.stringify({ error: 'Server not configured (Supabase service role / Resend missing)' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    let data: { gatheringId?: unknown };
    try {
      data = (await readJsonWithCap(req, 4096)) as { gatheringId?: unknown };
    } catch (e) {
      if (e instanceof PayloadTooLargeError) {
        return new Response(JSON.stringify({ error: 'Payload Too Large' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw e;
    }
    const gatheringId = String(data.gatheringId || '').slice(0, 60);
    if (!gatheringId) {
      return new Response(JSON.stringify({ error: 'gatheringId required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 读 active + notify_email=true 订阅者（email 非空，防 wechat-only 行混入 BCC 致整批失败）
    const supaResp = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?select=email,locale&active=eq.true&notify_email=eq.true&email=not.is.null`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    if (!supaResp.ok) {
      return new Response(JSON.stringify({ error: 'Supabase read failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const subscribers: Subscriber[] = await supaResp.json();
    if (subscribers.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'no active subscribers' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Resend 批量（BCC，单封多收件人，节约配额）
    // 隐私硬约束：to 只放发件方占位，订阅者全部进 bcc，互不可见
    const subjectZh = `[wo/men in tech] 新一期交流排期已上线`;
    const subjectEn = `[wo/men in tech] New gathering slot is live`;
    const textZh = `wo/men in tech · 新一期排期已上线。\n\n查看 https://wotech.space/upcoming\n或一次性订阅日历源：webcal://wotech.space/gatherings.ics\n\n随时可退订，零商业营销。\nhttps://wotech.space`;
    const textEn = `wo/men in tech · A new gathering slot is live.\n\nBrowse https://wotech.space/upcoming\nOr subscribe the calendar feed once: webcal://wotech.space/gatherings.ics\n\nUnsubscribe anytime. Zero marketing.\nhttps://wotech.space`;

    const zhEmails = subscribers.filter(s => s.locale !== 'en').map(s => s.email);
    const enEmails = subscribers.filter(s => s.locale === 'en').map(s => s.email);

    let sent = 0;
    const sendBatch = async (emails: string[], subject: string, text: string) => {
      if (emails.length === 0) return 0;
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: emailFrom,
            to: [emailFrom], // 占位收件人，真实订阅者全在 bcc
            bcc: emails.slice(0, 50), // Resend 单封 BCC 上限，分批
            subject,
            text,
          }),
        });
        return r.ok ? emails.length : 0;
      } catch {
        return 0;
      }
    };

    // 分批（Resend 单封至多 ~50 BCC；超量分多封）
    for (let i = 0; i < zhEmails.length; i += 50) {
      sent += await sendBatch(zhEmails.slice(i, i + 50), subjectZh, textZh);
    }
    for (let i = 0; i < enEmails.length; i += 50) {
      sent += await sendBatch(enEmails.slice(i, i + 50), subjectEn, textEn);
    }

    return new Response(JSON.stringify({ sent, total: subscribers.length, gatheringId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Notify API error:', err);
    return new Response(JSON.stringify({ error: 'notify failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
