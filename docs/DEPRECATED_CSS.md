# 废弃的 CSS 文件说明

> **2026-10-29 死代码清理**：以下文件经构建产物（dist）逐类核实为全站未使用，已删除——
> `markdown.css`、`typography/scale.css`、`components/{quotes,geometric,list-layout}.css`、
> `utilities/{flow,focus-mode,spacing,text,visibility}.css`。
> 现行结构以 `main.css` 的 `@import` 列表为准。

## ⚠️ 已废弃文件

以下文件已不再使用，保留仅供历史参考：

### `global-legacy.css` (76KB)

- **状态**: 🚫 已删除
- **原因**: 体积过大 (76KB)，样式定义混乱，已被模块化的 main.css 架构替代
- **迁移**: 所有需要的样式已迁移到模块化的 CSS 文件中
- **删除时间**: 2026-01-27

### `global.css` (5.4KB)

- **状态**: ✅ 已删除
- **原因**: 与 main.css 职责重叠，导致双轨入口问题
- **迁移完成**:
  - 基础重置 → `base/reset.css`
  - 排版系统 → `base/typography.css`
  - 容器布局 → `base/layout.css`
  - 视图过渡动画 → `base/reset.css`
  - 语义化辅助类 (`.page-title`, `.section-title`, `.card-title`) →
    `base/typography.css`
- **删除时间**: 2026-01-27

### `components.css` (21KB)

- **状态**: ✅ 已迁移并删除
- **原因**: 单体文件，已拆分到 components/ 目录
- **迁移完成**:
  - `components/buttons.css` - 按钮样式
  - `components/cards.css` - 卡片样式
  - `components/forms.css` - 表单样式
  - `components/sections.css` - 区块样式
  - `components/geometric.css` - 几何图标
  - `components/list-layout.css` - 列表布局
- **删除时间**: 2026-01 (已完成)

### `utilities.css` (2.4KB)

- **状态**: ✅ 已删除
- **原因**: 单体文件，已拆分到 utilities/ 目录
- **迁移完成**:
  - `utilities/display.css` - 显示和布局工具
  - `utilities/spacing.css` - 间距工具
  - `utilities/text.css` - 文本处理工具 (新增)
  - `utilities/visibility.css` - 可见性控制
  - `utilities/accessibility.css` - 辅助功能、focus、selection、print (新增)
  - `utilities/flow.css` - 垂直韵律系统 (新增)
  - `utilities/focus-mode.css` - Zen Mode 专注样式
  - `utilities/hover-effects.css` - 悬停效果
- **删除时间**: 2026-01-27

---

## ✅ 现行架构 (2026-01-27)

### 唯一入口

**`/src/styles/main.css`**

所有页面通过 `Layout.astro` 统一导入：

```astro
import '../styles/main.css' import '../styles/markdown.css'
```

### 📁 完整项目结构

```
src/styles/
├── main.css                    # 🎯 唯一入口
├── design-system.css          # Design Tokens (单一真相源)
├── markdown.css               # Markdown 内容样式
├── base/                      # 基础样式
│   ├── reset.css              # 重置 + font-feature-settings + 视图过渡
│   ├── typography.css         # 排版 + 语义化辅助类 + 响应式
│   ├── layout.css             # 容器、网格、Flexbox
│   └── decorations.css        # 背景光晕、装饰元素
├── components/                # 组件样式
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   ├── geometric.css
│   ├── list-layout.css
│   └── sections.css
├── utilities/                 # 工具类
│   ├── display.css            # Display, Flexbox, Grid
│   ├── spacing.css            # Margin, Padding
│   ├── text.css               # 文本处理 (transform, truncate, clamp)
│   ├── visibility.css         # Show/Hide
│   ├── accessibility.css      # A11y, Focus, Selection, Print
│   ├── flow.css               # 垂直韵律 (.flow)
│   ├── focus-mode.css         # Zen Mode
│   └── hover-effects.css      # 悬停动画
└── themes/                    # 主题
    └── dark.css               # 深色模式

```

---

## 🎯 架构原则

### 1. **单一真相源 (Single Source of Truth)**

- 所有 Design Token 仅在 `design-system.css` 定义
- 所有样式通过 `main.css` 统一导入

### 2. **模块化分层**

```
Design Tokens → Base → Components → Utilities → Themes
```

### 3. **职责清晰**

- **Base**: 全局标签默认样式
- **Components**: 可复用组件样式类
- **Utilities**: 单一职责工具类

### 4. **变量驱动**

- ✅ 使用 `var(--color-primary)`
- ❌ 禁止硬编码 `#547CA4`

---

## 📊 迁移完成统计

| 类别       | 迁移项                          | 目标位置                      | 状态 |
| ---------- | ------------------------------- | ----------------------------- | ---- |
| 基础重置   | `*, box-sizing`                 | `base/reset.css`              | ✅   |
| 字体特性   | `font-feature-settings`         | `base/reset.css`              | ✅   |
| 视图过渡   | `::view-transition`             | `base/reset.css`              | ✅   |
| 排版系统   | `h1-h6, p, code`                | `base/typography.css`         | ✅   |
| 语义辅助类 | `.page-title`, `.card-title`    | `base/typography.css`         | ✅   |
| 响应式调整 | `@media (width <= 640px)`       | `base/typography.css`         | ✅   |
| 容器布局   | `.container`                    | `base/layout.css`             | ✅   |
| 文本工具   | `.text-truncate`, `.text-clamp` | `utilities/text.css`          | ✅   |
| 辅助功能   | `.sr-only`, `::selection`       | `utilities/accessibility.css` | ✅   |
| 打印样式   | `@media print`                  | `utilities/accessibility.css` | ✅   |
| 垂直韵律   | `.flow`                         | `utilities/flow.css`          | ✅   |

**总计**: 11 个类别，100% 迁移完成 ✅

---

## 🗑️ 删除历史

| 文件                | 删除时间   | 迁移状态  |
| ------------------- | ---------- | --------- |
| `global-legacy.css` | 2026-01    | ✅ 已迁移 |
| `components.css`    | 2026-01    | ✅ 已迁移 |
| `global.css`        | 2026-01-27 | ✅ 已迁移 |
| `utilities.css`     | 2026-01-27 | ✅ 已迁移 |

---

## ✨ 维护建议

1. **永远不要创建新的全局 CSS 文件**
2. **新样式优先考虑**：
   - 能用现有组件？→ 直接用
   - 需要新组件？→ `components/*.css`
   - 需要工具类？→ `utilities/*.css`
3. **样式修改只在 `src/styles/` 目录内进行**
4. **禁止在页面中写内联 `style` 属性**

---

_最后更新: 2026-01-27_  
_架构版本: v2.0 (Complete Migration)_
