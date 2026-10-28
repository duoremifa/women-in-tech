// functions/api/notify.ts - Cloudflare Pages Function
// 新排期上线时，向邮件订阅者批量发送通知（一期就配，流量小）。
// 需 admin token（ADMIN_TOKEN env）+ service_role key（SUPABASE_SERVICE_ROLE_KEY env）。
// 触发方式：rebuild 后手动 curl，或 CI 在新排期 deploy 后调用。

interface Subscriber {
  email: string;
  locale: string;
}

export async function onRequestPost(context: any) {
  const req = context.request;
  const adminToken = context.env?.ADMIN_TOKEN;
  const sentToken = req.headers.get('x-admin-token');
  if (!adminToken || sentToken !== adminToken) {
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
    const data = await req.json();
    const gatheringId = String(data.gatheringId || '').slice(0, 60);
    if (!gatheringId) {
      return new Response(JSON.stringify({ error: 'gatheringId required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 读 active + notify_email=true 订阅者
    const supaResp = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?select=email,locale&active=eq.true&notify_email=eq.true`,
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
            to: emails.slice(0, 50), // Resend 单封 BCC 上限，分批
            bcc: emails.slice(0, 50),
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
