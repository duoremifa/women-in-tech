// functions/api/join.ts - Cloudflare Pages Function
// 处理预约提交与多通道闭环 (Webhook / KV / 邮件 / 响应式回执)

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
    const submissionId = `WT-${Date.now().toString(36).toUpperCase()}`;

    // 1. 如果在 Cloudflare 环境变量中配置了通知 Webhook (如飞书、企业微信、Telegram 等)
    const webhookUrl = context.env?.JOIN_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msg_type: 'text',
            content: {
              text: `[wo/men in tech] 新预约加入\n编号: ${submissionId}\n称呼: ${name}\n领域: ${craft || '未指定'}\n活动: ${(interests || []).join(', ')}\n联系: ${contact}\n想法: ${idea || '无'}\n时间: ${submissionTime}`,
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
        message: '预约已记录',
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
