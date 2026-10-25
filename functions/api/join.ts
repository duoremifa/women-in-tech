// functions/api/join.ts - Cloudflare Pages Function
// 闭环处理：表单提交 -> 生成回执 -> (若留邮箱) 触发 Resend 确认信 + .ics 日历占位附件 -> 邮件/Webhook 同步发起人

function generateICS(submissionId: string, name: string, interests: string[] = []): string {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const wantsCoffee = interests.includes('coffee') || interests.length === 0;
  const wantsEnglish = interests.includes('english') || interests.length === 0;
  const events: string[] = [];

  if (wantsCoffee) {
    events.push([
      'BEGIN:VEVENT',
      `UID:wotech-coffee-${submissionId}@wotech.space`,
      `DTSTAMP:${dtStamp}`,
      'DTSTART:20261108T063000Z', // 2026-11-08 (双周周日) 14:30 GMT+8
      'DTEND:20261108T080000Z',   // 2026-11-08 (双周周日) 16:00 GMT+8
      'SUMMARY:wo/men in tech · Coffee Chat（双周轻聚）',
      `DESCRIPTION:致 ${name || '同行者'}：\\n这是为你预留的 Coffee Chat 交流席位。\\n回执编号: #${submissionId}\\n形式：杭州线下静谧小店 + 线上接入\\n微信联络：daiminay`,
      'LOCATION:杭州静谧小店 / 线上视频连线',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:wo/men in tech · Coffee Chat 提醒',
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n'));
  }

  if (wantsEnglish) {
    events.push([
      'BEGIN:VEVENT',
      `UID:wotech-showtell-${submissionId}@wotech.space`,
      `DTSTAMP:${dtStamp}`,
      'DTSTART:20261111T120000Z', // 2026-11-11 (双周周三晚间) 20:00 GMT+8
      'DTEND:20261111T124500Z',   // 2026-11-11 (双周周三晚间) 20:45 GMT+8
      'SUMMARY:wo/men in tech · Show & Tell 英文技术与设计交流',
      `DESCRIPTION:致 ${name || '同行者'}：\\n这是为你预留的 Show & Tell 交流席位。\\n回执编号: #${submissionId}\\n形式：40 min 英文界面细节与代码架构分享 + Q&A\\n微信联络：daiminay`,
      'LOCATION:线上视频室 (活动前发放连线)',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:wo/men in tech · Show & Tell 提醒',
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n'));
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//wo/men in tech//Circle Gatherings//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

function getCraftLabel(craft: string): string {
  const map: Record<string, string> = {
    design: '设计 · 视觉传达 / 交互体验 (IxD)',
    product: '产品 · 逻辑推敲 / 独立孵化 (PM)',
    engineering: '工程 · 前端架构 / 独立全栈 (FE)',
    research: '研究 · 用户洞察 / 深度写作',
    other: '跨界探索 / 独立创造者',
  };
  return map[craft] || craft || '未指定';
}

function getInterestsLabel(interests: string[] = []): string {
  const map: Record<string, string> = {
    coffee: 'Coffee Chat (双周轻聚)',
    english: 'English Chat (40 min 试讲 + Q&A)',
    lab: '作品 · Lab (慢节奏打磨代表作)',
    view: '静默观察 / 先行了解',
  };
  if (!interests || interests.length === 0) return '未勾选特定项';
  return interests.map(k => map[k] || k).join('、');
}

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
· Coffee Chat：双周周末 · 杭州线下静谧小店 + 线上接入（3-5人）
· Show & Tell：双周周中晚间 · 40 min 英文深度分享与自由试错 + Q&A

如有任何即时想交流的细节，亦可随时微信联系我：daiminay（备注回执编号 #${submissionId} 即可）。

给推敲留出时间，让灵感自然生长。

—
wo/men in tech · 慢节奏女性技术与创造社群
https://wotech.space`;
}

export async function onRequestPost(context: any) {
  try {
    const data = await context.request.json();
    const { name, craft, interests, idea, contact } = data;

    if (!name || !contact) {
      return new Response(JSON.stringify({ error: '请提供姓名与联系方式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const submissionTime = new Date().toISOString();
    const submissionId = `WT-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const cleanContact = String(contact).trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);

    const craftLabel = getCraftLabel(craft);
    const interestsLabel = getInterestsLabel(interests);
    const icsContent = generateICS(submissionId, name, interests);

    let emailSent = false;
    let emailError: string | null = null;

    // 1. 若联系方式是 Email，触发确认信 + .ics 附件
    if (isEmail) {
      const emailHtml = buildEmailHtml({
        name,
        submissionId,
        craftName: craftLabel,
        interestNames: interestsLabel,
        idea,
      });
      const emailText = buildEmailText({
        name,
        submissionId,
        craftName: craftLabel,
        interestNames: interestsLabel,
        idea,
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
            const firstErr = await resendResp.text().catch(() => '');
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

    // 2. 无论是否留邮箱，通知发起人 (Webhook / Organizer Email)
    const webhookUrl = context.env?.JOIN_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msg_type: 'text',
            content: {
              text: `[wo/men in tech] 新预约加入\n编号: #${submissionId}\n称呼: ${name}\n领域: ${craftLabel}\n意向: ${interestsLabel}\n联系: ${cleanContact}\n想法: ${idea || '无'}\n邮箱触达: ${emailSent ? '成功' : (isEmail ? '未送达 (' + emailError + ')' : '微信方式')}\n时间: ${submissionTime}`,
            },
          }),
        });
      } catch (err) {
        console.error('Webhook notification error:', err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        submissionId,
        isEmail,
        emailSent,
        emailError,
        icsContent,
        wechatHost: 'daiminay',
        message: '意向已收录',
        timestamp: submissionTime,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: '提交解析异常: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
