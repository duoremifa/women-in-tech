export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // 允许 px / rem / em / 数字字重——设计系统已大量使用，规则须贴合实际
    'declaration-property-value-disallowed-list': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'has'],
      },
    ],
    // Astro scoped styles 用 :global()；放宽
    'keyframes-name-pattern': null,
    'no-duplicate-selectors': null,
    'font-family-no-missing-generic-family-keyword': null,
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    // 设计系统有意使用 !important 覆盖（双语 display:none 等）
    'declaration-no-important': null,
    // 设计系统采用紧凑单行块 + 旧记法 rgba(r,g,b,0.12) + @media (max-width:) ——
    // 这些是 stylelint-config-standard 的格式化偏好，与本项目实际风格冲突，放宽以贴合
    'declaration-block-single-line-max-declarations': null,
    'rule-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'media-feature-range-notation': null,
    'selector-not-notation': null,
    // 字体栈关键字大小写敏感（BlinkMacSystemFont / Arial 等），不该强制小写
    'value-keyword-case': null,
    // 项目未用 autoprefixer，-webkit-appearance 等手写前缀是必需的
    'property-no-vendor-prefix': null,
  },
  overrides: [
    {
      files: ['**/*.astro'],
      customSyntax: 'postcss-html',
    },
  ],
};
