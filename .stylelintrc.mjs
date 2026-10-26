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
  },
  overrides: [
    {
      files: ['**/*.astro'],
      customSyntax: 'postcss-html',
    },
  ],
};
