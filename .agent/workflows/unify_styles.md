---
description: Global Design System Unification Plan
---

# 执行计划：全局样式与排版强力统一 (Global Style Unification)

**目标**：消除样式碎片化，建立单一事实来源 (Single Source of
Truth)，确保全站视觉节奏统一。

## 阶段一：清理与合并 (Consolidation) - **已部分完成**

1.  **卡片系统统一** (已完成)
    - [x] 在 `components.css` 中建立统一的 `.card` 基类。
    - [x] 让 `.status-card`, `.feature-card` 等所有卡片变体继承基类。

2.  **Markdown 排版继承** (已完成)
    - [x] 重构 `markdown.css`，移除 H2-H4 的字体定义，强制继承 `global.css`。
    - [x] 统一段落间距。

## 阶段二：深度排版审计 (Typography Audit) - **当前重点**

1.  **全局 H1-H6 扫描**
    - 检查 `components.css` 中剩余的标题定义（如 `.post-title`,
      `.hero-title`），确保它们使用 `var(--font-family-serif/sans)` 而非硬编码。
    - 强制 `.post-title`
      等组件标题使用新定义的 H3/H4 样式变量，保持字号与全局标题阶梯一致。

2.  **Line-height 归一化**
    - 检查 `global.css` 与 `design-system.css` 中的 `line-height` 定义。
    - 确保所有文本容器（Body, Markdown, Card Content）统一使用
      `--line-height-relaxed` (1.5) 作为正文标准。

## 阶段三：间距系统标准化 (Spacing Standardization)

1.  **Section 间距统一**
    - 定义全局 Section 工具类（如 `.section-container`），统一
      `margin-bottom: var(--spacing-20)`。
    - 替换首页 (`index.astro`) 和落地页 (`landing.astro`) 中手动写的 margin。

2.  **组件内部间距**
    - 审计卡片内部标题与内容的间距，统一使用 `--spacing-4` 或 `--spacing-6`。
    - 移除 Astro 文件中（如
      `index.astro`）对卡片标题 margin 的 CSS 覆写（`margin-top: 0`
      应设为全局卡片默认行为）。

## 阶段四：颜色清理 (Color Cleanup)

1.  **移除硬编码颜色**
    - 扫描 `components.css`，将所有 Hex 颜色替换为 `var(--color-...)` 变量。
2.  **Legacy 色板废除**
    - 逐步查找使用 `--color-primary-50` 等旧变量的地方，替换为
      `--color-primary-light` 或透明度混合颜色 (`color-mix`)。
    - 最终从 `design-system.css` 中移除 Legacy 色板。

## 阶段五：Astro 页面 CSS 清理

1.  **移除 Local CSS 补丁**
    - 在全局样式修正后，回到 `index.astro`, `landing.astro` 等页面。
    - 删除为了修复旧样式而添加的 `style` 块中的补丁代码（如手动调整 H2
      margin 的代码）。

---

**执行顺序**：我们将按顺序执行 阶段二 -> 阶段三 -> 阶段四 -> 阶段五。
