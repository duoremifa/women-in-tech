# wo/men in tech · women in technical

> **在快与喧嚣里，留一个安静的座位——给手作，给深度，给署名。**
> women in tech：以个体之名做事的女性——手艺人、设计师、工程师、艺术工作者、工作室主、写作者。

自托管的个人名片 + 引力场站点（Astro 5 静态 + Cloudflare Pages）。名字保留 women in Tech，底层故事服务于"独立个体、慢节奏、署名"的理念。tech 是一面向，非定位边界。

---

## 信息架构

```
/            首页 · 两栏（左 sticky 侧栏 + 右展陈），无顶部导航，侧栏定向 + 最新一期播客 + 单 CTA
/ethos       理念 · manifesto + 原则（极简单栏）
/podcast     Friction Log 播客 · 期次 + shownotes + RSS（女性社群对谈实录方向，内容待填）
/writing     田野手记 · 深度访谈独立女性创造者（月更，含受访者品牌链接，内容待填）
/upcoming    近期安排 · 真实排期 + per-slot .ics 直订 + webcal 订阅 + 轻 RSVP + 已结束回环
/events      机制 · Coffee Chat / English Chat / Craft Lab 的原则与收获
/works       正在打磨 · TypeSpec / Whisper Letter（概念阶段）
/join        加入 · 表单 + 订阅开关（webcal / 邮件）+ ?slot= 轻 RSVP
/reviews/[slug]  回顾 · 相见后回环（占位框架）
/podcast/rss.xml  播客 RSS feed
/gatherings.ics   webcal 日历源（全部未过期排期）
/gatherings/[id].ics  单期 .ics 直订
```

顶部导航（子页，首页隐藏）：理念 · 播客 · 手记 · 排期 · 机制 · 加入

---

## 内容维护（不用本地 IDE）

- **排期 gatherings**：编辑 `src/data/gatherings.ts`（顶部有注释 + 新增模板），GitHub 网页编辑器改 → push → Cloudflare 自动重建。.ics / webcal / join API / JSON-LD 全读此单一源。
- **播客 podcast**：往 `src/content/podcast/` 加 markdown 文件（frontmatter: title/pubDate/duration/audio/平台 + body: shownotes）。
- **田野手记 writing**：往 `src/content/writing/` 加 markdown（frontmatter: title/pubDate/interviewee{name/role/brand/location/links} + body）。每位受访者品牌链接 per-person，无泛用模板。

---

## 设计系统

宁静低压（Quiet Luxury & Tactile UI）——纸感肌理背景、磨砂薰衣草紫灰、哑光金线、深卡其黑文本。8px 基线网格。纸感噪点由 `theme.ts` 应用到 `<html>`（极淡）。几何视觉系统（GeometricVisual / GeometricIcon）与播客站共用。

文本对比度达 WCAG AA（tertiary 浅色 #756f64 / 深色 #8a8478）。排版启用 old-style 数字 + 标点悬挂。

---

## 技术

- Astro 5 静态输出 + Cloudflare Pages Functions（`/api/join` `/api/subscribe` `/api/notify`）
- 自托管 woff2 字体（`scripts/self-host-fonts.mjs`，prebuild 生成，网络失败回退系统字体）
- PWA service worker（`src/sw.js`，workbox injectManifest）
- 双语 zh/en（JS + localStorage + `data-lang` 属性 + CSS `.lang-zh/.lang-en`）
- 邮件订阅 → Supabase `subscribers` 表（RLS 公共 INSERT）；批量通知 `/api/notify`（admin token + Resend）
- 内容闭环：gatherings → 录制 → podcast → 沉淀 writing → 回流（双向 `episodeSlug` / `gatheringId` 联动）

---

## 启动

```bash
npm install
npm run dev        # 本地开发（prebuild 自动生成字体）
npm run build      # 生产构建
npm run type-check # astro check
```

环境变量（Cloudflare Pages → Settings → Environment variables）见 `SUPABASE_SETUP.md`。

---

*以个体之名 · by Dai Min*
