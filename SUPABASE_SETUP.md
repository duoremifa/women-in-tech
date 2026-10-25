# Supabase Setup Guide for Friction Log Survey

本项目使用 Supabase 存储匿名问卷数据。请按照以下步骤配置数据库。

## 1. 创建项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard) 并登录。
2. 点击 **New Project**。
3. 地区推荐选择 `Singapore` 或 `Tokyo`。
4. 等待数据库初始化完成。

## 2. 获取 API Keys

1. 在项目面板左下角，点击 **Project Settings** (齿轮图标)。
2. 选择 **API**。
3. 复制 `Project URL` 和 `anon public` public Key。
4. 在项目根目录创建 `.env` 文件并填入：

```bash
PUBLIC_SUPABASE_URL=你的_Project_URL
PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_key
```

## 3. 初始化问卷表 (SQL Editor)

点击左侧菜单的 **SQL Editor**，运行以下 SQL 代码：

```sql
-- 创建问卷表
CREATE TABLE survey_responses (
  response_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  locale TEXT,
  duration_seconds INTEGER,
  user_agent TEXT,
  age_group TEXT,
  work_status TEXT,
  work_status_other TEXT,
  country_region TEXT,
  nd_self_id TEXT,
  nd_diagnosis TEXT,
  time_fragmentation TEXT,
  task_switch_effort TEXT,
  main_tools_todo_apps BOOLEAN,
  main_tools_note_tools BOOLEAN,
  main_tools_digital_calendar BOOLEAN,
  main_tools_paper_planner BOOLEAN,
  main_tools_chat_apps BOOLEAN,
  main_tools_physical_reminders BOOLEAN,
  main_tools_in_my_head BOOLEAN,
  main_tools_other BOOLEAN,
  main_tools_other_text TEXT,
  system_resets_12m TEXT,
  satisfaction_0_10 INTEGER,
  nps_recommend_0_10 INTEGER,
  sla1_crumble_weeks INTEGER,
  sla2_energy_on_system INTEGER,
  sla3_wrong_brain_assumption INTEGER,
  sla4_self_blame INTEGER,
  sla5_shadow_systems INTEGER,
  sla6_life_interruptions_vs_tools INTEGER,
  sla7_rules_lead_to_collapse INTEGER,
  chasing_system_freq TEXT,
  missed_due_system_freq TEXT,
  burden_vs_relief TEXT,
  tools_work_why TEXT
);

-- 安全策略：开启 RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 允许匿名提交 (INSERT)
CREATE POLICY "Public Insert" ON survey_responses FOR INSERT WITH CHECK (true);

-- 允许管理员读取 (可选：仅限鉴权用户)
-- CREATE POLICY "Admin Select" ON survey_responses FOR SELECT USING (auth.role() = 'authenticated');
```

## 4. 导出数据 (CSV)

1. 进入 **Table Editor** -> `survey_responses`。
2. 点击 **Export** -> **Export as CSV**。
