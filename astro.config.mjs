import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import AstroPWA from '@vite-pwa/astro';
import cssnano from 'cssnano';

export default defineConfig({
  site: 'https://women-in-tech.pages.dev',
  base: '/',
  trailingSlash: 'ignore',

  // Cloudflare Pages 适配器配置
  output: 'static',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false,
  }),

  // 构建优化配置
  build: {
    format: 'file',
  },

  // 🛡️ Vite配置 - 包含CSP支持和构建优化
  vite: {
    define: {
      'import.meta.env.CSP_NONCE': JSON.stringify(process.env.CSP_NONCE || 'womenintech-csp-nonce'),
    },

    // 🎨 PostCSS配置优化
    css: {
      devSourcemap: false,
      transformer: 'lightningcss',
      postcss: {
        plugins: [
          cssnano({
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                minifySelectors: true,
                minifyParams: true,
                mergeRules: true,
                sortProperties: true,
                reduceIdents: false,
                shortIdents: false,
              },
            ],
          }),
        ],
      },
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['@vite-pwa/astro'],
            pwa: ['vite-plugin-pwa'],
            css: ['lightningcss', 'cssnano'],
          },
        },
      },
      minify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
    },
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultTheme: 'light',
    },
  },

  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
      ],
      manifest: {
        name: 'wo/men in tech',
        short_name: 'wo/men',
        description: 'women in technical · 既是女性，亦是“我们”的技术与创造联合体',
        theme_color: '#f8f6f2',
        background_color: '#f8f6f2',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/404$/],
        suppressWarnings: true,
      },
    }),
  ],
});
