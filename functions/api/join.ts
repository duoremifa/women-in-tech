// functions/api/join.ts - Cloudflare Pages Function
// 闭环处理：表单提交 -> 生成回执 -> (若留邮箱) 触发 Resend 确认信 + .ics 日历占位附件 -> 邮件/Webhook 同步发起人
// 共享逻辑（ICS 生成、兴趣匹配、校验、清洗）抽至 src/lib/join-shared.ts，与 dev 中间件、客户端兜底共用。

import {
  generateICS,
  getCraftLabel,
  getInterestsLabel,
  escapeHtml,
  sanitizeForWebhook,
  isValidEmailFormat,
  VALID_CRAFTS,
  VALID_INTERESTS,
  WECHAT_HANDLE,
} from '../../src/lib/join-shared';

function buildEmailHtml(params: {
  name: string;
  submissionId: string;
  craftName: string;
  interestNames: string;
  idea?: string;
}): string {
  const { name, submissionId, craftName, interestNames, idea } = params;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>wo/men in tech · 交流预约回执</title>
<style>
  body {
    margin: 0;
    padding: 40px 16px;
    background-color: #FAF8F5;
    font-family: -apple-system, BlinkMacSystemFont, "Songti SC", "SimSun", "Noto Serif CJK SC", "Times New Roman", serif;
    color: #242220;
    line-height: 1.8;
  }
  .paper-card {
    max-width: 580px;
    margin: 0 auto;
    background-color: #FFFFFF;
    border: 1px solid #E8E2D9;
    padding: 44px 36px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  }
  .brand-line {
    border-bottom: 1px solid #EFEAE3;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .brand-title {
    font-size: 20px;
    color: #5e4c7a;
    font-weight: 400;
    margin: 0 0 4px;
    letter-spacing: -0.01em;
  }
  .brand-sub {
    font-size: 11px;
    color: #8C8680;
    margin: 0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .greeting {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
    color: #1A1918;
  }
  .receipt-tag {
    display: inline-block;
    padding: 4px 12px;
    background: #FAF8F5;
    border: 1px solid #E8E2D9;
    font-family: ui-monospace, Menlo, Monaco, monospace;
    font-size: 13px;
    color: #967a42;
    margin: 12px 0 24px;
    letter-spacing: 0.04em;
  }
  .detail-panel {
    background: #FCFBF9;
    border-left: 2px solid #5e4c7a;
    padding: 16px 20px;
    margin: 20px 0 28px;
    font-size: 13.5px;
    color: #4A4642;
    line-height: 1.7;
  }
  .detail-row {
    margin: 6px 0;
  }
  .detail-label {
    color: #8C8680;
    margin-right: 8px;
  }
  .cal-invite-box {
    font-size: 13px;
    color: #5C5650;
    background: #F8F6F2;
    border: 1px dashed #DCD5CC;
    padding: 16px 20px;
    margin: 24px 0;
    line-height: 1.65;
  }
  .wechat-box {
    background: #FAF8F5;
    border: 1px solid #E8E2D9;
    padding: 16px 20px;
    margin: 24px 0;
    font-size: 13.5px;
    color: #383532;
  }
  .wechat-box strong {
    color: #5e4c7a;
  }
  .footer-meta {
    border-top: 1px solid #EFEAE3;
    padding-top: 20px;
    margin-top: 36px;
    font-size: 12px;
    color: #99938D;
    line-height: 1.6;
  }
</style>
</head>
<body>
  <div class="paper-card">
    <div class="brand-line">
      <h1 class="brand-title">wo/men in tech</h1>
      <p class="brand-sub">women in technical · "我们"</p>
    </div>
    
    <div class="greeting">致 ${name}：</div>
    
    <p>你的交流意向已静默送达。</p>
    <div class="receipt-tag">回执编号：#${submissionId}</div>
    
    <div class="detail-panel">
      <div class="detail-row"><span class="detail-label">所选领域：</span>${craftName}</div>
      <div class="detail-row"><span class="detail-label">参与意向：</span>${interestNames}</div>
      ${idea ? `<div class="detail-row"><span class="detail-label">关注话题：</span>${idea}</div>` : ''}
    </div>

    <p>在商业流水线的空隙里，总有一些东西是做给自己的。很高兴能遇见同样对手艺与思考保有执念的你。</p>
    
    <div class="cal-invite-box">
      ✦ <strong>已随信附带本期交流日历邀请（.ics 附件）</strong><br>
      包含 Coffee Chat 与 Show & Tell 交流时段。双击附件即可直接添加入 Apple 日历、Google Calendar 或 Outlook 占位。
    </div>

    <div class="wechat-box">
      <strong>微信直接交流</strong>：<code>daiminay</code><br>
      <span style="font-size: 12px; color: #8C8680;">添加时请备注回执编号 #${submissionId}，我们将邀你进入当期交流席位。</span>
    </div>

    <p style="margin-top: 24px; font-style: italic; color: #6E6862; font-size: 13.5px;">给推敲留出时间，让灵感自然生长。</p>

    <div class="footer-meta">
      wo/men in tech · 既是女性，亦是“我们”的技术与创造联合体<br>
      <a href="https://wotech.space" style="color: #5e4c7a; text-decoration: none;">https://wotech.space</a>
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(params: {
  name: string;
  submissionId: string;
  craftName: string;
  interestNames: string;
  idea?: string;
}): string {
  const { name, submissionId, craftName, interestNames, idea } = params;
  return `✦ wo/men in tech
women in technical · "我们"

致 ${name}：

你的交流意向已静默送达。
回执编号：#${submissionId}

所选领域：${craftName}
参与意向：${interestNames}
${idea ? `关注话题：${idea}\n` : ''}
在商业流水线的空隙里，总有一些东西是做给自己的。很高兴能遇见同样对手艺与思考保有执念的你。

附件为你预约的本期交流日历邀请（.ics）。导入系统日历（Apple 日历 / Google Calendar / Outlook）即可自动占位。

近期安排概要：
· Coffee Chat：双周周末 · 杭州线下 + 线上接入（3-5人）
· Show & Tell：双周周中晚间 · 40 min 英文深度分享与自由试错 + Q&A

如有任何即时想交流的细节，亦可随时微信联系我：daiminay（备注回执编号 #${submissionId} 即可）。

给推敲留出时间，让灵感自然生长。

—
wo/men in tech · 慢节奏女性技术与创造社群
https://wotech.space`;
}

// ==============================================================================
// 商业级安全与防 DoS 防护层 (Cloudflare Edge Firewall & Anti-Abuse)
// ==============================================================================
const RATE_LIMIT_STORE = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_WINDOW = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 分钟窗口

function secureJsonResponse(body: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      ...extraHeaders,
    },
  });
}

function checkIpRateLimit(ip: string): boolean {
  // 若未获取到 IP 则放入受限匿名池，绝不绕过限制
  const safeIp = ip && ip !== 'unknown' ? ip : '__shared_anonymous_pool__';
  const now = Date.now();

  // 严格上限清理，杜绝 Map 内存持续扩张
  if (RATE_LIMIT_STORE.size > 1500) {
    for (const [k, v] of RATE_LIMIT_STORE.entries()) {
      if (v.resetAt < now) RATE_LIMIT_STORE.delete(k);
    }
    if (RATE_LIMIT_STORE.size > 2000) {
      RATE_LIMIT_STORE.clear();
    }
  }

  const record = RATE_LIMIT_STORE.get(safeIp);
  if (!record || record.resetAt < now) {
    RATE_LIMIT_STORE.set(safeIp, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

function isOriginAllowed(originHeader: string | null, refererHeader: string | null, env: any): boolean {
  // 必须存在来源头，杜绝无头跨站伪造或外部脚本盲投
  const target = originHeader || refererHeader;
  if (!target) return false;
  try {
    const url = new URL(target);
    const host = url.hostname.toLowerCase();
    return (
      host === 'wotech.space' ||
      host.endsWith('.wotech.space') ||
      host === 'women-in-tech.pages.dev' ||
      host.endsWith('-women-in-tech.pages.dev') ||
      (Boolean(env?.DEV_MODE) && (host === 'localhost' || host === '127.0.0.1'))
    );
  } catch {
    return false;
  }
}

export async function onRequestPost(context: any) {
  const req = context.request;

  // 1. 请求体尺寸硬顶限制 (防大包 DoS)
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > 10240) {
    return secureJsonResponse({ error: '请求数据过大 / Payload Too Large' }, 413);
  }

  // 2. 来源与 CSRF 严苛校验 (只放行指定域名与项目域)
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  if (!isOriginAllowed(origin, referer, context.env)) {
    return secureJsonResponse({ error: '非法跨域请求 / Forbidden' }, 403);
  }

  // 3. IP 级速率限制 (防批量脚本刷接口、爆破邮件配额)
  const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkIpRateLimit(clientIp)) {
    return secureJsonResponse(
      { error: '提交请求过于频繁，请稍候再试 / Too many requests, please try again in a few minutes.' },
      429,
      { 'Retry-After': '600' }
    );
  }

  try {
    const data = await req.json();

    // 4. 蜜罐陷阱 (Honeypot Trap) 与时间陷阱 (Time Trap)
    const isHoneypotTriggered = Boolean(data._hp || data._company_trap || data.company || data.website);
    const clientTime = Number(data._t || 0);
    const elapsed = clientTime > 0 ? Date.now() - clientTime : 99999;
    const isTooFast = elapsed < 1500;

    const submissionTime = new Date().toISOString();
    const submissionId = `WT-${Date.now().toString(36).slice(-5).toUpperCase()}`;

    if (isHoneypotTriggered || isTooFast) {
      // 静默防御：返回假成功 200，绝不调用 Resend API 或 Webhook，零服务器资源消耗
      return secureJsonResponse({
        success: true,
        submissionId,
        isEmail: false,
        emailSent: false,
        wechatHandle: WECHAT_HANDLE,
        message: '意向已收录',
        timestamp: submissionTime,
      });
    }

    const { name, craft, interests, idea, contact } = data;

    if (!name || !contact) {
      return secureJsonResponse({ error: '请提供姓名与联系方式' }, 400);
    }

    // 5. 白名单校验与输入深度清洗（VALID_CRAFTS/VALID_INTERESTS 来自 join-shared）
    const safeCraftKey = (VALID_CRAFTS as readonly string[]).includes(String(craft)) ? String(craft) : 'other';

    const safeInterests = Array.isArray(interests)
      ? interests.filter((i: unknown) => typeof i === 'string' && (VALID_INTERESTS as readonly string[]).includes(i)).slice(0, 5)
      : [];

    const safeName = escapeHtml(name, 40);
    const cleanContact = String(contact).trim().slice(0, 80);
    const safeIdea = escapeHtml(idea, 600);
    const isEmail = isValidEmailFormat(cleanContact);

    const craftLabel = getCraftLabel(safeCraftKey);
    const interestsLabel = getInterestsLabel(safeInterests);
    const icsContent = generateICS(submissionId, safeName, safeInterests);

    let emailSent = false;
    let emailError: string | null = null;

    // 5. 若联系方式是合法 Email，触发确认信 + .ics 附件
    if (isEmail) {
      const emailHtml = buildEmailHtml({
        name: safeName,
        submissionId,
        craftName: craftLabel,
        interestNames: interestsLabel,
        idea: safeIdea,
      });
      const emailText = buildEmailText({
        name: safeName,
        submissionId,
        craftName: craftLabel,
        interestNames: interestsLabel,
        idea: safeIdea,
      });

      // 1.1 尝试 Resend API (从 Cloudflare 环境变量获取)
      const resendApiKey = context.env?.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          // 在 Node / CF Workers 环境下将 UTF-8 字符串转 Base64
          const icsBase64 = btoa(unescape(encodeURIComponent(icsContent)));
          const defaultDomainFrom = context.env?.EMAIL_FROM || 'wo/men in tech <invitation@wotech.space>';

          // 优先尝试自定义域名发送
          let resendResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: defaultDomainFrom,
              to: [cleanContact],
              subject: `[wo/men in tech] 交流预约确认与日历邀请 #${submissionId}`,
              html: emailHtml,
              text: emailText,
              attachments: [
                {
                  filename: `wotech-gathering-${submissionId}.ics`,
                  content: icsBase64,
                },
              ],
            }),
          });

          // 若域名尚未在 Resend 完成 DNS 验证，自动降级为官方 onboarding@resend.dev 通道重试
          if (!resendResp.ok) {
            await resendResp.text().catch(() => '');
            resendResp = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'wo/men in tech <onboarding@resend.dev>',
                to: [cleanContact],
                subject: `[wo/men in tech] 交流预约确认与日历邀请 #${submissionId}`,
                html: emailHtml,
                text: emailText,
                attachments: [
                  {
                    filename: `wotech-gathering-${submissionId}.ics`,
                    content: icsBase64,
                  },
                ],
              }),
            });
          }

          if (resendResp.ok) {
            emailSent = true;
          } else {
            const errJson: any = await resendResp.json().catch(() => ({}));
            emailError = errJson.message || `Resend HTTP ${resendResp.status}`;
          }
        } catch (e: any) {
          emailError = e.message;
        }
      }

      // 1.2 备用：SendGrid API
      const sendgridKey = context.env?.SENDGRID_API_KEY;
      if (!emailSent && sendgridKey) {
        try {
          const icsBase64 = btoa(unescape(encodeURIComponent(icsContent)));
          const sgResp = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sendgridKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: cleanContact }] }],
              from: { email: context.env?.SENDGRID_FROM || 'invitation@wotech.space', name: 'wo/men in tech' },
              subject: `[wo/men in tech] 交流预约确认与日历邀请 #${submissionId}`,
              content: [
                { type: 'text/plain', value: emailText },
                { type: 'text/html', value: emailHtml },
              ],
              attachments: [
                {
                  content: icsBase64,
                  type: 'text/calendar; method=REQUEST',
                  filename: `wotech-gathering-${submissionId}.ics`,
                  disposition: 'attachment',
                },
              ],
            }),
          });
          if (sgResp.ok || sgResp.status === 202) {
            emailSent = true;
          }
        } catch (e: any) {
          if (!emailError) emailError = e.message;
        }
      }
    }

    // 6. 无论是否留邮箱，通知发起人 (Webhook / Organizer Email，经深度字符清洗与 HTTPS 严格校验)
    const webhookUrl = context.env?.JOIN_WEBHOOK_URL;
    if (webhookUrl && (webhookUrl.startsWith('https://') || webhookUrl.startsWith('http://localhost'))) {
      try {
        const safeWebhookText = `[wo/men in tech] 新预约加入\n编号: #${submissionId}\n称呼: ${sanitizeForWebhook(safeName)}\n领域: ${craftLabel}\n意向: ${interestsLabel}\n联系: ${sanitizeForWebhook(cleanContact)}\n想法: ${sanitizeForWebhook(safeIdea) || '无'}\n邮箱触达: ${emailSent ? '成功' : isEmail ? '未送达' : '微信方式'}\n时间: ${submissionTime}`;

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msg_type: 'text',
            content: { text: safeWebhookText },
          }),
        });
      } catch (err) {
        console.error('Webhook notification error:', err);
      }
    }

    // 7. 零信息泄漏安全回执响应 (严禁向客户端泄露服务内部错误、密钥或堆栈)
    return secureJsonResponse({
      success: true,
      submissionId,
      isEmail,
      emailSent,
      wechatHandle: WECHAT_HANDLE,
      message: '意向已收录',
      timestamp: submissionTime,
    });
  } catch (err: any) {
    console.error('Join API processing error:', err);
    return secureJsonResponse({ error: '提交解析异常，请稍候重试' }, 500);
  }
}
