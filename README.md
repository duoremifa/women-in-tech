# wo/men in tech · women in technical

> **women in technical · 既是女性，亦是“我们”的技术与创造联合体**  
> *A collaborative community & laboratory for Product Managers (PM), Interaction Designers (IxD), and Frontend Engineers (FE) to co-create, coffee chat, and build real-world portfolios.*

---

## 🌟 核心理念 · Core Concept

- **“wo/men” 的双重语义**：
  - **Women in Technical**：深耕于技术与设计前沿的女性专业力量。
  - **我们 (Us / Together)**：告别单兵作战的孤岛体验，以互助和协同建立坚固的创造同盟。
- **三大角色三角闭环**：
  - 📐 **Product Managers (产品经理)**：定义问题与业务闭环，0-1 MVP 架构规划。
  - 🎨 **Interaction Designers (交互与体验设计)**：视觉传达、设计系统 (Design Tokens)、触感与微交互。
  - 💻 **Frontend Engineers (前端开发架构)**：现代化 Web 技术落地、响应式还原、高可用与高性能。
- **核心活动与节奏**：
  - ☕ **Offline & Online Coffee Chat**：双周低压真诚对话，分享卡壳的 side project、技术与设计探索。
  - 🗣️ **English Tech & Design Chat**：跨文化场景下的 Show & Tell，练习用英文陈述作品与方案。
  - 🛠️ **Portfolio Co-Building (代表作共建)**：借助相互经验，打磨能直接上线的独立产品与个人作品集。

---

## 🎨 视觉风格与设计系统 (Design System)

继承并复用**宁静低压设计系统 (Quiet Luxury & Tactile UI)**：
- **纸感肌理背景**：`--color-bg-page: #f8f6f2`（手工棉纸质感，温和不反光）
- **品牌主色**：`--color-primary: #b7aad9`（磨砂薰衣草紫灰，温柔克制）
- **点缀色**：`--color-gold-dust: #d8cdb0`（哑光金线，象征温度与细腻）
- **文字层次**：`--color-text-primary: #26221c`（深卡其黑，极高可读、极低压迫）
- **版式系统**：经典双栏画廊布局（Sticky Sidebar + Content Feed），移动端优雅降级自适应。

---

## 🚀 项目结构与启动

```bash
# 1. 进入项目目录
cd /Users/erin/.gemini/antigravity/scratch/women-in-tech

# 2. 安装依赖
npm install

# 3. 本地启动开发预览
npm run dev

# 4. 构建生产产物
npm run build
```

---

## 📁 目录概览

```
women-in-tech/
├── astro.config.mjs            # Astro 5 + Cloudflare / PWA 配置
├── package.json                # 项目依赖与元数据
├── src/
│   ├── layouts/
│   │   └── Layout.astro        # 全局双栏骨架与设计系统挂载
│   ├── components/
│   │   ├── Navbar.astro        # 顶栏导航 (理念/角色/活动/作品/预约)
│   │   ├── Footer.astro        # 底部品牌与角色签名
│   │   ├── GeometricVisual.astro # 极简几何视觉装饰
│   │   └── SEO.astro           # 动态元数据与社交分享标签
│   ├── pages/
│   │   └── index.astro         # 核心主页（理念阐述、三大角色、活动栈、日程、RSVP）
│   └── styles/
│       ├── design-system.css   # 核心变量（色彩、间距、圆角、阴影）
│       ├── main.css            # 全局样式入口
│       └── components/         # 卡片、表单、按钮原子组件样式
└── public/                     # 字体、Favicon、静态资源
```

---

*Crafted by Erin & Co. with quiet luxury, high availability, and mutual support.*
