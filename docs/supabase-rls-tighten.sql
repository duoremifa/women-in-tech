-- ============================================================================
-- subscribers 表 RLS 收紧（安全审计代码层修复配套）
-- 配套文档：docs/SECURITY_CF_HARDENING.md §6；校验口径对齐 functions/api/join.ts
-- 与 src/lib/join-shared.ts（isValidEmailFormat / cleanContact / safeIdea）。
-- 执行位置：Supabase Dashboard → SQL Editor 直接运行（可整份粘贴，幂等）。
--
-- 执行顺序（重要）：
--   1) 先跑本文件全部语句（INSERT policy → UPDATE policy → 列级 GRANT）。
--   2) 再测 /api/subscribe：同邮箱二次 POST 应 200，且 subscribers 不重复建行
--      （merge-duplicates 依赖 email 列的 UNIQUE 约束，见文末备注）。
--   3) 回归 /api/join：带 slot_id 的提交应正常入库、回执邮件照常发送。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. anon INSERT 收紧：与 join.ts 的校验口径一致
--    （原 policy 若为 WITH CHECK (true) 则先 drop 再重建）
-- ----------------------------------------------------------------------------
drop policy if exists "subscribers_anon_insert" on public.subscribers;

create policy "subscribers_anon_insert"
  on public.subscribers
  for insert
  to anon
  with check (
    -- join.ts / subscribe.ts 恒写 active = true；禁止直插休眠行
    active = true
    -- email：null（wechat-only 行）或匹配 join-shared.ts isValidEmailFormat 同款正则；
    -- 正则中的单引号按 SQL 规则转义为两个单引号
    and (
      email is null
      or (
        email ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
        and length(email) <= 80
      )
    )
    -- wechat 与 email 二选一入库（join.ts cleanContact trim 后 slice(0, 80)）
    and coalesce(length(wechat), 0) <= 80
    -- idea：join.ts 入库的是 escapeHtml(idea, 600) 的产物，HTML 实体展开
    -- （如 ' → &#x27;，6 字符/字）后最长约 3600，故上限取 3600 而非 600
    and coalesce(length(idea), 0) <= 3600
    -- source：join.ts / subscribe.ts 均为自由串截断 40（无硬枚举），此处同口径限长
    and coalesce(length(source), 0) <= 40
    -- notify_email=true 的行必须带 email：防 wechat-only 行混入 notify.ts 的
    -- BCC 批（查询条件 email=not.is.null 已挡读侧，此处挡写侧）
    and (coalesce(notify_email, false) = false or email is not null)
  );

-- ----------------------------------------------------------------------------
-- 2. anon UPDATE：为 subscribe.ts 的 upsert 服务
--    subscribe.ts 用 `Prefer: resolution=merge-duplicates` 做 upsert，其
--    INSERT ... ON CONFLICT DO UPDATE 在 RLS 下要求存在 UPDATE policy，否则 403。
--    using(true)：允许命中任意同邮箱冲突行（订阅者之间无法互相识别行 id）；
--    with check：限制更新后的行形状与 INSERT 同口径。
--    注意：RLS policy 无法按列限制——列级保护由下方第 3 段 GRANT 实现。
-- ----------------------------------------------------------------------------
drop policy if exists "subscribers_anon_update" on public.subscribers;

create policy "subscribers_anon_update"
  on public.subscribers
  for update
  to anon
  using (true)
  with check (
    active = true
    and (
      email is null
      or (
        email ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
        and length(email) <= 80
      )
    )
    and coalesce(length(wechat), 0) <= 80
    and coalesce(length(idea), 0) <= 3600
    and coalesce(length(source), 0) <= 40
    and (coalesce(notify_email, false) = false or email is not null)
  );

-- ----------------------------------------------------------------------------
-- 3. 列级保护（RLS 无法按列限制，用列级 GRANT 锁死服务端列）
--    PostgREST upsert（merge-duplicates）的 SET 子句恰好只含 subscribe.ts
--    POST 的六列：email / locale / source / notify_email / notify_calendar / active。
--    revoke 表级 UPDATE 后仅按列授予，anon 便无法改 id / created_at / receipt_id /
--    idea / wechat / slot_id / interests / craft 等服务端列。
--
--    若 /api/subscribe 因此报 42501（列权限错误），先回滚本段再排查：
--      grant update on public.subscribers to anon;
-- ----------------------------------------------------------------------------
revoke update on public.subscribers from anon;
grant update (email, locale, source, notify_email, notify_calendar, active)
  on public.subscribers to anon;

-- ----------------------------------------------------------------------------
-- 备注：merge-duplicates 依赖 email 列的 UNIQUE 约束（ON CONFLICT 用）。
-- 若建表时未加，先执行（wechat-only 行 email 为 NULL，NULL 不参与唯一冲突）：
--   alter table public.subscribers
--     add constraint subscribers_email_unique unique (email);
--
-- 同理建议（SECURITY_CF_HARDENING.md §6 已列，属可选补充，本文不强制执行）：
--   - notify_email=true ⇒ email 非空 的 CHECK 约束；
--   - anon 的 SELECT / DELETE 保持不存在（只留 INSERT + UPDATE）。
-- ============================================================================
