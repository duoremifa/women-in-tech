export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'declaration-property-value-disallowed-list': {
      'font-size': ['/px/', '/rem/', '/em/'],
      'font-weight': ['/^\\d+$/'], // Disallow numeric weights like 400, 600
    },
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    'keyframes-name-pattern': null,
    'no-duplicate-selectors': null,
    'font-family-no-missing-generic-family-keyword': null,
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    'no-descending-specificity': null,
  },
  overrides: [
    {
      files: ['**/*.astro'],
      customSyntax: 'postcss-html',
    },
  ],
};
