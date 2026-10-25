# 标签系统统一管理文档

## 📋 标签定义（唯一真实来源）

所有标签在整个系统中保持一致的命名和显示：

| 标签 ID        | 显示文本    | 颜色主题   | 使用场景                       |
| -------------- | ----------- | ---------- | ------------------------------ |
| `self-care`    | 自我照顾    | 柔和薄荷绿 | 与自我关怀、休息、身心健康相关 |
| `work`         | 工作 / 学习 | 柔和紫色   | 与工作、学习、生产力相关       |
| `relationship` | 关系 / 沟通 | 柔和蓝色   | 与人际关系、沟通、社交相关     |
| `energy`       | 能量 / 疲惫 | 柔和琥珀   | 与能量状态、疲劳、倦怠相关     |
| `other`        | 其他        | 温和灰色   | 其他未分类的内容               |

## 🎨 样式系统

### 全局样式定义

所有标签样式统一在 `src/styles/global.css` 中管理：

```css
/* 基础标签样式 */
.tag {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-wide);
}

/* 语义化标签颜色 */
.tag-self-care { ... }
.tag-work { ... }
.tag-relationship { ... }
.tag-energy { ... }
.tag-other { ... }
```

### 使用方式

在 HTML 中使用标签时，添加对应的类名：

```html
<span class="tag tag-self-care">自我照顾</span>
<span class="tag tag-work">工作 / 学习</span>
<span class="tag tag-relationship">关系 / 沟通</span>
```

在 JavaScript 中动态生成：

```javascript
const tag = 'self-care';
const tagHtml = `<span class="tag tag-${tag}">${formatTag(tag)}</span>`;
```

## 📍 标签使用位置

### 1. 留言表单 (`src/components/GuestbookForm.astro`)

表单中的标签选择使用 `.tag-pill` 类,选中时会应用对应的语义化颜色:

```html
<label class="tag-pill" for="tag-self-care">
  <input type="checkbox" id="tag-self-care" name="tags" value="self-care" />
  <span>自我照顾</span>
</label>
```

对应的 CSS 样式:

```css
/* 未选中状态 - 统一的中性样式 */
.tag-pill span {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
}

/* 选中状态 - 语义化颜色 */
.tag-pill[for='tag-self-care'] input:checked + span {
  background: rgba(154, 215, 187, 0.15);
  border-color: rgba(154, 215, 187, 0.3);
  color: #62a084;
}
```

### 2. 留言显示 (`src/pages/guestbook.astro`)

```javascript
function formatTag(tag) {
  const tagMap = {
    'self-care': '自我照顾',
    work: '工作 / 学习',
    relationship: '关系 / 沟通',
    energy: '能量 / 疲惫',
    other: '其他',
  };
  return tagMap[tag] || tag;
}

// 在 renderMessages 中使用
const tagsHtml = msg.tags
  .map(tag => `<span class="tag tag-${tag}">${formatTag(tag)}</span>`)
  .join('');
```

## ✅ 一致性检查清单

在添加或修改标签时，确保：

- [ ] 标签 ID 在所有地方保持一致（kebab-case）
- [ ] 显示文本在 `formatTag` 函数中正确映射
- [ ] 在 `GuestbookForm.astro` 中的表单选项使用相同的 value
- [ ] 在 `global.css` 中定义了对应的 `.tag-{id}` 样式
- [ ] 颜色符合"宁静陪伴"的设计哲学（低饱和度、柔和）

## 🔄 添加新标签的步骤

1. **在 `global.css` 中添加样式**：

   ```css
   .tag-new-tag {
     background: rgba(R, G, B, 0.15);
     color: #HEX;
     border: 1px solid rgba(R, G, B, 0.3);
   }
   ```

2. **在 `GuestbookForm.astro` 中添加选项**：

   ```html
   <label class="tag-pill" for="tag-new-tag">
     <input type="checkbox" id="tag-new-tag" name="tags" value="new-tag" />
     <span>新标签显示名</span>
   </label>
   ```

3. **在 `guestbook.astro` 的 `formatTag` 函数中添加映射**：
   ```javascript
   const tagMap = {
     // ... 其他标签
     'new-tag': '新标签显示名',
   };
   ```

## 🎯 设计原则

- **颜色柔和**：所有标签使用低饱和度颜色，避免视觉刺激
- **语义清晰**：标签名称直观易懂，无需额外解释
- **视觉一致**：所有标签使用相同的圆角、内边距、字体大小
- **可访问性**：确保文字与背景有足够的对比度

---

**最后更新**: 2026-01-19  
**维护者**: FrictionLog Team
