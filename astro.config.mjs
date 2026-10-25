import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';
import cssnano from 'cssnano';

export default defineConfig({
  site: 'https://wotech.space',
  base: '/',
  trailingSlash: 'ignore',

  // 纯静态输出模式 (本地开发极其快速、零依赖无报错)
  output: 'static',

  // 构建优化配置
  build: {
    format: 'file',
  },

  vite: {
    define: {
      'import.meta.env.CSP_NONCE': JSON.stringify(process.env.CSP_NONCE || 'womenintech-csp-nonce'),
    },

    plugins: [
      {
        name: 'dev-api-join-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/join' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body || '{}');
                  const { name, craft, interests, idea, contact } = data;
                  const submissionId = `WT-${Date.now().toString(36).slice(-5).toUpperCase()}`;
                  const cleanContact = String(contact || '').trim();
                  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);

                  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                  const icsContent = [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'PRODID:-//wo/men in tech//Circle Gatherings//CN',
                    'CALSCALE:GREGORIAN',
                    'METHOD:REQUEST',
                    'BEGIN:VEVENT',
                    `UID:wotech-${submissionId}@wotech.space`,
                    `DTSTAMP:${dtStamp}`,
                    'DTSTART:20261107T020000Z',
                    'DTEND:20261107T033000Z',
                    'SUMMARY:wo/men in tech · Coffee Chat & Show and Tell 交流席位',
                    `DESCRIPTION:致 ${name || '同行者'}：\\n欢迎加入 wo/men in tech 慢节奏交流。\\n回执编号: #${submissionId}\\n近期安排：\\n1. Coffee Chat（杭州线下 / 线上连线）\\n2. Show & Tell（40 min 英文界面细节与代码架构分享 + Q&A）\\n主理人微信：daiminay`,
                    'LOCATION:线上视频室 (活动前发放连线) / 杭州静谧小店',
                    'STATUS:CONFIRMED',
                    'SEQUENCE:0',
                    'BEGIN:VALARM',
                    'TRIGGER:-PT30M',
                    'ACTION:DISPLAY',
                    'DESCRIPTION:wo/men in tech 交流提醒',
                    'END:VALARM',
                    'END:VEVENT',
                    'END:VCALENDAR',
                  ].join('\r\n');

                  let emailSent = false;
                  const resendKey = process.env.RESEND_API_KEY;
                  if (isEmail && resendKey) {
                    try {
                      const icsBase64 = Buffer.from(icsContent).toString('base64');
                      let rResp = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${resendKey}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          from: 'wo/men in tech <onboarding@resend.dev>',
                          to: [cleanContact],
                          subject: `[wo/men in tech] 交流预约确认与日历邀请 #${submissionId}`,
                          text: `✦ wo/men in tech · "我们"\n\n致 ${name || '同行者'}：\n你的交流意向已静默送达。\n回执编号：#${submissionId}\n\n已随信附带本期交流日历邀请（.ics 附件）。\n包含 Coffee Chat 与 Show & Tell 交流时段。\n\n主理人微信快速通道：daiminay\n（添加时请备注回执编号 #${submissionId}）\n\n给推敲留出时间，让灵感自然生长。\nhttps://wotech.space`,
                          attachments: [
                            {
                              filename: `wotech-gathering-${submissionId}.ics`,
                              content: icsBase64,
                            },
                          ],
                        }),
                      });
                      if (rResp.ok) emailSent = true;
                    } catch (e) {}
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(
                    JSON.stringify({
                      success: true,
                      submissionId,
                      isEmail,
                      emailSent,
                      icsContent,
                      wechatHost: 'daiminay',
                      message: '意向已收录',
                      timestamp: new Date().toISOString(),
                    })
                  );
                } catch (err) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ],

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
