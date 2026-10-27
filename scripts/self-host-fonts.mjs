#!/usr/bin/env node
/**
 * self-host-fonts.mjs — 把 Google Fonts CSS2 的 woff2 子集下载到本地并生成本地 @font-face。
 *
 * 做法：以浏览器 UA 请求 CSS2，解析返回的 @font-face 块（含 unicode-range 切分），
 * 把每个 woff2 下载到 public/fonts/，并生成 src/styles/typography/font-faces.css
 * 用本地 URL 替换 gstatic URL。完全保留 Google 的 unicode-range 按需加载策略。
 *
 * 仅自托管 Latin 字体（Inter + Lora）。CJK 不自托管——Noto Serif SC 有 ~100 个子集、
 * 总计数十 MB，会让 Chrome 加载极慢。CJK 走系统栈（Source Han Serif SC / Songti SC /
 * STSong / PingFang SC / Microsoft YaHei），零下载即时渲染。
 * 非拉丁子集（cyrillic/greek/vietnamese）本站永不使用，过滤掉。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(ROOT, 'public', 'fonts');
const CSS_OUT = path.join(ROOT, 'public', 'fonts', 'fonts.css');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const ACCEPT_LANG = 'zh-CN,zh;q=0.9,en;q=0.8';
const FETCH_HEADERS = { 'User-Agent': UA, 'Accept-Language': ACCEPT_LANG };

const FAMILIES = [
  { family: 'Inter', weights: [400, 500, 600, 700] },
  { family: 'Lora', weights: [400, 500, 600, 700] },
];

// 只保留拉丁子集——cyrillic/greek/vietnamese 本站永不使用，过滤掉省 CSS + 文件
const KEEP_SUBSETS = new Set(['latin', 'latin-ext']);

const slug = s =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function fetchCss(family, weights) {
  const w = weights.join(';');
  const q = family.replace(/ /g, '+');
  const url = `https://fonts.googleapis.com/css2?family=${q}:wght@${w}&display=swap`;
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`CSS2 ${family} HTTP ${res.status}`);
  return res.text();
}

function parseFaces(css) {
  const faces = [];
  // 匹配可选的 /* comment */ 前缀 + @font-face { ... }
  const re = /(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*{([^}]+)}/g;
  let m;
  let anonIdx = 0;
  while ((m = re.exec(css)) !== null) {
    const comment = m[1];
    const block = m[2];
    const weightMatch = block.match(/font-weight:\s*([0-9]+)\s*;/);
    const urlMatch = block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);
    const styleMatch = block.match(/font-style:\s*(\w+)/);
    const displayMatch = block.match(/font-display:\s*(\w+)/);
    if (!weightMatch || !urlMatch) continue;
    // subset 名：优先用注释，否则用 unicode-range 首段，否则用索引
    let subset = comment ? comment.trim() : '';
    if (!subset) {
      const range = (rangeMatch?.[1] || '').trim();
      const first = range.split(',')[0].trim();
      subset = first || `chunk-${++anonIdx}`;
    }
    subset = subset.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    faces.push({
      subset,
      weight: weightMatch[1],
      url: urlMatch[1],
      unicodeRange: (rangeMatch?.[1] || '').trim(),
      style: (styleMatch?.[1] || 'normal').trim(),
      display: (displayMatch?.[1] || 'swap').trim(),
    });
  }
  return faces;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`download ${url} HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

/** 写一个最小 fonts.css（无 @font-face），让 <link> 不 404、字体回退到系统栈。 */
function writeFallbackCss(reason) {
  if (fs.existsSync(CSS_OUT)) return; // 已有真字体缓存则不覆盖
  fs.writeFileSync(
    CSS_OUT,
    `/* fonts.css fallback: ${reason}. 自托管字体生成失败（构建机无法访问 Google Fonts），\n   暂用系统字体回退。本地或可联网环境重跑 \`npm run fonts\` 即可恢复自托管 woff2。 */\n`,
  );
  console.log(`⚠ wrote fallback fonts.css (${reason}); build proceeds with system fonts.`);
}

async function main() {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
  const allFaces = [];
  try {
    for (const { family, weights } of FAMILIES) {
      const css = await fetchCss(family, weights);
      const faces = parseFaces(css).filter(f => KEEP_SUBSETS.has(f.subset));
      console.log(`${family}: parsed ${parseFaces(css).length} → kept ${faces.length} (latin only)`);
      for (const f of faces) {
        const localName = `${slug(family)}-${f.weight}-${slug(f.subset)}.woff2`;
        const dest = path.join(FONTS_DIR, localName);
        if (!fs.existsSync(dest)) {
          const size = await download(f.url, dest);
          console.log(`  ✓ ${localName} (${size} B) [${f.subset}]`);
        } else {
          console.log(`  • ${localName} (exists) [${f.subset}]`);
        }
        allFaces.push({ ...f, family, localPath: `/fonts/${localName}` });
      }
    }
  } catch (err) {
    // 联网失败：有缓存则用缓存，无缓存则写 fallback css，绝不阻断 build
    if (fs.existsSync(CSS_OUT)) {
      console.log(`⚠ font fetch failed (${err.message}); using cached fonts.css`);
      return;
    }
    writeFallbackCss(err.message);
    return;
  }

  if (allFaces.length === 0) {
    writeFallbackCss('no faces parsed');
    return;
  }

  // 生成本地 @font-face CSS
  const lines = [
    '/* ============================================',
    '   本地自托管字体 @font-face',
    '   由 scripts/self-host-fonts.mjs 生成',
    '   来源：Google Fonts CSS2 的 woff2 子集，已下载至 /fonts/',
    '   保留 unicode-range 按需加载策略（CJK 仅在用到时加载）',
    '   ============================================ */',
    '',
  ];
  for (const f of allFaces) {
    lines.push(`/* ${f.family} ${f.weight} · ${f.subset} */`);
    lines.push('@font-face {');
    lines.push(`  font-family: '${f.family}';`);
    lines.push(`  font-style: ${f.style};`);
    lines.push(`  font-weight: ${f.weight};`);
    lines.push(`  font-display: ${f.display};`);
    lines.push(`  src: url(${f.localPath}) format('woff2');`);
    if (f.unicodeRange) lines.push(`  unicode-range: ${f.unicodeRange};`);
    lines.push('}');
    lines.push('');
  }

  fs.writeFileSync(CSS_OUT, lines.join('\n'));
  console.log(`\n✅ wrote ${CSS_OUT} (${allFaces.length} faces)`);
  console.log(`📁 font files in ${FONTS_DIR}`);
}

main().catch(err => {
  // 兜底：即使 main 内部异常漏出，也不让 build 崩
  try { writeFallbackCss(`unexpected: ${err && err.message || err}`); } catch (e) {}
  console.error('✗ self-host-fonts failed (non-blocking):', err);
  // 不 exit(1)：prebuild 失败时让 astro build 继续（系统字体回退）
});
