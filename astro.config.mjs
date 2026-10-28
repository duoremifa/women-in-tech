import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import cssnano from 'cssnano';

export default defineConfig({
  site: 'https://wotech.space',
  base: '/',
  trailingSlash: 'ignore',

  // 纯静态输出模式 (本地开发极其快速、零依赖无报错)
  output: 'static',

  // 预取：链接进入视口时预取（viewport），点击秒开；移动端无 hover 也能预取，
  // 且不像 hover+prefetchAll 那样一次性预取全部 nav/footer 链接浪费带宽
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  // 构建优化配置
  build: {
    format: 'file',
  },

  vite: {
    plugins: [
      {
        name: 'dev-api-join-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/join' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body || '{}');
                  if (data._hp) {
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(
                      JSON.stringify({
                        success: true,
                        submissionId: 'WT-TRAP0',
                        isEmail: false,
                        emailSent: false,
                      })
                    );
                    return;
                  }
                  const { name, interests, contact } = data;
                  const submissionId = `WT-${Date.now().toString(36).slice(-5).toUpperCase()}`;
                  const cleanContact = String(contact || '').trim();
                  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);

                  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                  const userInterests = Array.isArray(interests) ? interests : [];
                  const wantsCoffee =
                    userInterests.includes('coffee_chat') ||
                    userInterests.includes('coffee') ||
                    userInterests.length === 0;
                  const wantsEnglish =
                    userInterests.includes('english_chat') ||
                    userInterests.includes('english') ||
                    userInterests.length === 0;
                  const events = [];

                  if (wantsCoffee) {
                    events.push(
                      [
                        'BEGIN:VEVENT',
                        `UID:wotech-coffee-${submissionId}@wotech.space`,
                        `DTSTAMP:${dtStamp}`,
                        'DTSTART:20261108T063000Z',
                        'DTEND:20261108T080000Z',
                        'SUMMARY:wo/men in tech · Coffee Chat（双周轻聚）',
                        `DESCRIPTION:致 ${name || '同行者'}：\\n这是为你预留的 Coffee Chat 交流席位。\\n回执编号: #${submissionId}\\n形式：杭州线下 + 线上接入\\n微信联络：daiminay`,
                        'LOCATION:杭州线下 / 线上连线',
                        'STATUS:CONFIRMED',
                        'SEQUENCE:0',
                        'BEGIN:VALARM',
                        'TRIGGER:-PT30M',
                        'ACTION:DISPLAY',
                        'DESCRIPTION:wo/men in tech · Coffee Chat 提醒',
                        'END:VALARM',
                        'END:VEVENT',
                      ].join('\r\n')
                    );
                  }

                  if (wantsEnglish) {
                    events.push(
                      [
                        'BEGIN:VEVENT',
                        `UID:wotech-showtell-${submissionId}@wotech.space`,
                        `DTSTAMP:${dtStamp}`,
                        'DTSTART:20261111T120000Z',
                        'DTEND:20261111T124500Z',
                        'SUMMARY:wo/men in tech · Show & Tell 英文技术与设计交流',
                        `DESCRIPTION:致 ${name || '同行者'}：\\n这是为你预留的 Show & Tell 交流席位。\\n回执编号: #${submissionId}\\n形式：40 min 英文界面细节与代码架构分享 + Q&A\\n微信联络：daiminay`,
                        'LOCATION:线上视频室 (活动前发放连线)',
                        'STATUS:CONFIRMED',
                        'SEQUENCE:0',
                        'BEGIN:VALARM',
                        'TRIGGER:-PT30M',
                        'ACTION:DISPLAY',
                        'DESCRIPTION:wo/men in tech · Show & Tell 提醒',
                        'END:VALARM',
                        'END:VEVENT',
                      ].join('\r\n')
                    );
                  }

                  const icsContent = [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'PRODID:-//wo/men in tech//Circle Gatherings//CN',
                    'CALSCALE:GREGORIAN',
                    'METHOD:REQUEST',
                    ...events,
                    'END:VCALENDAR',
                  ].join('\r\n');

                  let emailSent = false;
                  const resendKey = process.env.RESEND_API_KEY;
                  if (isEmail && resendKey) {
                    try {
                      const icsBase64 = Buffer.from(icsContent).toString('base64');
                      const rResp = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${resendKey}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          from: 'wo/men in tech <onboarding@resend.dev>',
                          to: [cleanContact],
                          subject: `[wo/men in tech] 交流预约确认与日历邀请 #${submissionId}`,
                          text: `✦ wo/men in tech · "我们"\n\n致 ${name || '同行者'}：\n你的交流意向已静默送达。\n回执编号：#${submissionId}\n\n已随信附带本期交流日历邀请（.ics 附件）。\n包含 Coffee Chat 与 Show & Tell 交流时段。\n\n微信直接交流：daiminay\n（添加时请备注回执编号 #${submissionId}）\n\n给推敲留出时间，让灵感自然生长。\nhttps://wotech.space`,
                          attachments: [
                            {
                              filename: `wotech-gathering-${submissionId}.ics`,
                              content: icsBase64,
                            },
                          ],
                        }),
                      });
                      if (rResp.ok) emailSent = true;
                    } catch {
                      /* dev 中间件：邮件发送尽力而为，不阻断响应 */
                    }
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('X-Content-Type-Options', 'nosniff');
                  res.setHeader('Cache-Control', 'no-store, max-age=0');
                  res.statusCode = 200;
                  res.end(
                    JSON.stringify({
                      success: true,
                      submissionId,
                      isEmail,
                      emailSent,
                      wechatHandle: 'daiminay',
                      message: '意向已收录',
                      timestamp: new Date().toISOString(),
                    })
                  );
                } catch {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: '提交解析异常，请稍候重试' }));
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
      lightningcss: {
        // 显式 targets：让前缀决策可控可预期（项目无 autoprefixer，手写 -webkit- 保留）
        targets: { chrome: 100, safari: 15, firefox: 115, edge: 100 },
      },
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
                sortProperties: false,
                reduceIdents: false,
                shortIdents: false,
              },
            ],
          }),
        ],
      },
    },

    build: {
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
    sitemap({
      changefreq: 'weekly',
      priority: 0.9,
      // 与 robots.txt/noindex 意图一致：works/reviews 是 noindex 详情，不进 sitemap
      filter: page => !page.includes('/works/') && !page.includes('/reviews/'),
    }),
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
        theme_color: '#f7f5f0',
        background_color: '#f7f5f0',
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
