# Supabase Setup Guide for wo/men in tech

本项目用 Supabase 存储订阅者与加入意向（替代 FrictionLog 残留的 survey_responses 表）。订阅闭环：webcal 日历源（纯静态，零后端）+ 邮件订阅（存 Supabase，新排期上线批量通知）。

## 1. 创建项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard) 并登录。
2. **New Project**；地区推荐 `Singapore` 或 `Tokyo`。
3. 等待数据库初始化完成。

## 2. 获取 API Keys

1. 项目面板左下 **Project Settings** (齿轮) → **API**。
2. 复制 `Project URL`、`anon public` key、`service_role` key。
3. 在 Cloudflare Pages → 项目 → Settings → Environment variables 配置：
   - `PUBLIC_SUPABASE_URL` = Project URL
   - `PUBLIC_SUPABASE_ANON_KEY` = anon public key（客户端可见，仅 INSERT，RLS 保护）
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key（**仅 CF Function env，绝不入库不入前端**，用于 /api/notify 批量读订阅者）
   - `ADMIN_TOKEN` = 自定义随机串（保护 /api/notify 触发）
   - `RESEND_API_KEY` = Resend key（邮件发送）
   - `EMAIL_FROM` = 发信地址（如 `wo/men in tech <invitation@wotech.space>`）

> `.env.example` 已含 `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY`（本地开发用）。

## 3. 初始化 subscribers 表（SQL Editor）

```sql
-- 订阅者表（邮件订阅 + 加入意向持久化）
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random.uuid(),
  email TEXT,
  wechat TEXT,
  locale TEXT DEFAULT 'zh',
  source TEXT,                  -- 'join' | 'rsvp' | 'subscribe-only'
  slot_id TEXT,                 -- 从 /upcoming 轻 RSVP 带来的具体期 id
  interests TEXT[],             -- coffee_chat / english_chat / portfolio_building
  craft TEXT,
  idea TEXT,
  receipt_id TEXT UNIQUE,       -- WT-xxxxx
  notify_email BOOLEAN DEFAULT TRUE,
  notify_calendar BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 公共 INSERT（join.ts / subscribe.ts 用 anon key 写入）
CREATE POLICY "Public Insert" ON subscribers FOR INSERT WITH CHECK (true);

-- 读取/更新仅限 service_role（notify.ts 批量读；前端 anon key 不能读）
-- service_role 绕过 RLS，无需额外 policy。

CREATE INDEX idx_subscribers_active ON subscribers(active) WHERE active = true;
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- 邮箱唯一约束（支持 upsert：同 email 合并）
CREATE UNIQUE INDEX idx_subscribers_email_unique ON subscribers(email) WHERE email IS NOT NULL;
```

## 4. 退订

退订逻辑（后续实现）：`/api/unsubscribe?token=<receipt_id>` → UPDATE subscribers SET active=false WHERE receipt_id=$token。MVP 阶段邮件退订链接占位，手动处理。

## 5. 导出 / 管理

1. 进入 **Table Editor** → `subscribers`。
2. 可按 `source`、`active`、`locale` 筛选。
3. 导出 CSV 用于手动联系或迁移。
