# Cloudflare 原生安全加固清单

代码侧的防护（恒定时间 token 比较、body 流式截断、origin 收紧、BCC 隐私修复等）已落地在
`functions/api/*`。以下是需要**你在 Cloudflare dashboard 手动配置**的 edge 级加固——
这些跨 isolate 原子生效，是内存 Map 限流达不到的强度。按顺序勾掉即可。

站点：`wotech.space`（Cloudflare Pages 项目 `wotech` / `women-in-tech`）

## 1. WAF Rate Limiting Rules（首选，零代码，解决暴破/刷接口）

Dashboard → Security → WAF → Rate limiting rules → Create rule。

| 规则 | 匹配表达式 | 特征字段 | 阈值 | 动作 |
|---|---|---|---|---|
| join 限流 | `(http.request.uri.path eq "/api/join") and (http.request.method eq "POST")` | `cf.connecting_ip` | 10 req / 10 min | Block + 10 min |
| subscribe 限流 | `(http.request.uri.path eq "/api/subscribe") and (http.request.method eq "POST")` | `cf.connecting_ip` | 20 req / hour | Block + 1 hour |
| notify 防爆破 | `(http.request.uri.path eq "/api/notify") and (http.request.method eq "POST")` | `cf.connecting_ip` | 10 req / min | Block + 10 min |

这些规则在 edge 跨 isolate 原子计数，是 `functions/api/*` 里内存 Map 限流的真正替代。
配完后，代码里的内存 Map 退为纵深防御兜底（可保留）。

## 2. Turnstile（人机校验，从根上断脚本刷接口）

1. Dashboard → Turnstile → Add site → 填 `wotech.space`，模式选 **Invisible**（宁静低压站无感）。
2. 拿到 **Site Key**（前端用）+ **Secret Key**（服务端用）。
3. 在 Pages 项目 Settings → Environment variables 加：
   - `TURNSTILE_SITE_KEY`（可公开，前端用）
   - `TURNSTILE_SECRET_KEY`（仅服务端）
4. 告诉我两个 key 已就位（**不要把 secret 贴给我**），我把 Turnstile widget 接入
   `join.astro`/`upcoming.astro` 表单 + 服务端 `functions/api/join.ts`/`subscribe.ts` 的
   `siteverify` 校验写上。

> Turnstile 免费无限次。配好后 origin 校验降为纵深防御，不再是唯一防线。

## 3. CF Access（Zero Trust）保护 `/api/notify`（一揽子解决 admin 接口）

`/api/notify` 是 admin 触发群发的接口，靠静态 `ADMIN_TOKEN` 保护（已加恒定时间比较 + 限流，
但 token 仍可被捕获重放）。最干净的方案是用 CF Access 把整个路径保护起来，连 token 都不用自己管：

1. Dashboard → Zero Trust → Access → Applications → Add an application → Self-hosted。
2. Application domain：`wotech.space` / path：`/api/notify`。
3. Policy：只允许你的邮箱 / Service Token 调用。
4. 之后 CI/本机调用 `/api/notify` 改用 Access Service Token（头 `CF-Access-Client-Id` +
   `CF-Access-Client-Secret`），`ADMIN_TOKEN` 可保留作第二层或删除。

## 4. Bot Fight Mode（免费，一键）

Dashboard → Security → Bots → Bot Fight Mode → On。挡匿名 botnet 自动化。付费版可开
Super Bot Fight Mode（细分类别）。

## 5. Page Shield（监控前端脚本注入）

Dashboard → Security → Page Shield → On。当前 CSP 仍带 `script-src 'unsafe-inline'`
（Astro 内联脚本需要），Page Shield 作为补充监控异常脚本注入。未来若把 Astro 内联脚本改
哈希/nonce，可去掉 `unsafe-inline`。

## 6. Supabase RLS 复核（数据层，配套）

`subscribers` 表的 Row Level Security 策略必须复核（Supabase Dashboard → Authentication →
Policies → `subscribers` 表）：

- **anon role 只允许 INSERT**，禁止 SELECT/UPDATE/DELETE（否则 anon key 泄露可读全表邮箱）。
- INSERT 限制列：`email`、`locale`、`source`、`slot_id`、`interests`、`craft`、`idea`、
  `receipt_id`、`notify_email`、`notify_calendar`、`active`、`wechat`。禁止写入
  `id`/`created_at`/服务端字段。
- `email` 列加 CHECK 约束（regex，与 `join-shared.ts:isValidEmailFormat` 同口径），
  防止绕过 API 校验直接 POST 脏数据。
- `email` 加 UNIQUE 约束（subscribe.ts 用 `resolution=merge-duplicates`，无 unique 会生成重复行）。
- `notify_email=true` 的行必须有 `email NOT NULL`（与 `notify.ts` 查询的
  `&email=not.is.null` 配套，可再加 DB 层 CHECK）。

> `PUBLIC_SUPABASE_*` 变量名虽带 PUBLIC 前缀，但只在 Pages Functions（服务端 env）取用，
> 未进客户端 bundle。只要 RLS 锁死 anon 写权限，即使 anon key 泄露也无法读全表。

## 7. Resend / SendGrid 配额熔断告警

Resend Dashboard → Webhooks / Notifications → 设置单日发送量告警（如 >N 封即邮件通知）。
作为 WAF 限流被突破时的熔断信号——一旦配额异常上涨，立刻去 CF dashboard 加临时 Block 规则
+ 轮转 `RESEND_API_KEY`。

## 8. `_headers` 复核（已配，确认即可）

`public/_headers` 已有：HSTS preload 2 年、CSP 白名单、X-Frame-Options DENY、
Permissions-Policy 全封、COOP/CORP same-origin、Server 指纹抹除。建议在 `/api/*` 段显式
重复一遍 `Strict-Transport-Security` 与 `Content-Security-Policy`，防未来某条更具体规则
意外覆盖。
