#!/usr/bin/env node
/**
 * self-host-fonts.mjs — 把 Google Fonts CSS2 的 woff2 子集下载到本地并生成本地 @font-face。
 *
 * 做法：以浏览器 UA 请求 CSS2，解析返回的 @font-face 块（含 unicode-range 切分），
 * 把每个 woff2 下载到 public/fonts/，并生成 public/fonts/fonts.css
 * 用本地 URL 替换 gstatic URL。完全保留 Google 的 unicode-range 按需加载策略。
 *
 * Latin（Inter + Lora）走 unicode-range 子集；CJK 走 text= 精确子集——按站内实际
 * 用到的字符请求 Noto Serif SC（思源宋体），让 iOS/Windows/Android 的中文标题渲染
 * 统一（此前系统栈分裂：Windows 落宋体、iOS 落苹方）。
 * 非拉丁子集（cyrillic/greek/vietnamese/latin-ext）本站永不使用，过滤掉。
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

// 字重取舍：300 = --font-weight-light 令牌实际所指（首页 h1/.site-title 等 18 处在用），
// 必须真实存在才能渲染出轻盈感；600 全库零引用，删。
// 注意：Lora 是 400–700 变量字体，Google 不提供 300 字重（CSS2 请求 300 会被静默丢弃），
// 所以 Lora 不含 300——font-weight: 300 用在 Lora 上时浏览器就近取 400。
const FAMILIES = [
  { family: 'Inter', weights: [300, 400, 500, 700] },
  { family: 'Lora', weights: [400, 500, 700] },
];

// 只保留 latin 子集——latin-ext 全站零引用（2026-10 实测 8 文件 420KB 无一处 unicode 命中），
// cyrillic/greek/vietnamese 同理本站永不使用，过滤掉省 CSS + 文件
const KEEP_SUBSETS = new Set(['latin']);

// ---- CJK 衬线自托管子集（Noto Serif SC / 思源宋体）----
// 背景：latin 子集自托管后，中文仍走系统栈——Windows 落 SimSun、iOS 落苹方（无衬线），
// 跨平台标题质感分裂。这里按「站内实际用到的 CJK 字符」请求 Google CSS2 的 text= 参数，
// 得到只含这些字形的小子集，全平台标题渲染统一。
// text= 的 URL 会很长（CJK percent-encode 后每字 9 字节），按 chunkSize 分片请求，
// 每片自己算 unicode-range（text= 返回的 CSS 不带 unicode-range）。
const CJK = {
  family: 'Noto Serif SC',
  weight: 400,
  filePrefix: 'noto-serif-sc',
  chunkSize: 300, // 300 字/片 ≈ 2.7KB URL，远离 ~8KB 服务器上限
};

const CJK_CODE_RE = /[\u3000-\u303F\u3400-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/;

function collectCjkChars(rootDir) {
  const chars = new Set();
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(astro|ts|md|mjs)$/.test(e.name)) {
        const t = fs.readFileSync(p, 'utf-8');
        for (const ch of t) if (CJK_CODE_RE.test(ch)) chars.add(ch);
      }
    }
  };
  walk(rootDir);
  return [...chars].sort();
}

/** 码点序列 → unicode-range 串（连续段合并） */
function codepointsToRange(chars) {
  const cps = chars.map(c => c.codePointAt(0)).sort((a, b) => a - b);
  const runs = [];
  let start = cps[0];
  let prev = cps[0];
  for (const cp of cps.slice(1)) {
    if (cp === prev + 1) {
      prev = cp;
    } else {
      runs.push([start, prev]);
      start = prev = cp;
    }
  }
  runs.push([start, prev]);
  return runs
    .map(([a, b]) => (a === b ? `U+${a.toString(16)}` : `U+${a.toString(16)}-${b.toString(16)}`))
    .join(',');
}

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
    // text= 动态子集的 URL 形如 https://fonts.gstatic.com/l/font?kit=...（无 .woff2 后缀），
    // 统一按 "url(...) format('woff2')" 匹配两种形态
    const urlMatch = block.match(/url\((https:\/\/[^)]+)\)\s*format\('woff2'\)/);
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
    subset = subset
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
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
    `/* fonts.css fallback: ${reason}. 自托管字体生成失败（构建机无法访问 Google Fonts），\n   暂用系统字体回退。本地或可联网环境重跑 \`npm run fonts\` 即可恢复自托管 woff2。 */\n`
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
      console.log(
        `${family}: parsed ${parseFaces(css).length} → kept ${faces.length} (latin only)`
      );
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
    // ---- CJK 衬线子集（text= 精确子集，分片规避 URL 长度上限）----
    const cjkChars = collectCjkChars(path.join(ROOT, 'src'));
    const manifestPath = path.join(FONTS_DIR, `${CJK.filePrefix}-${CJK.weight}-cjk.chars`);
    const manifestSame =
      fs.existsSync(manifestPath) && fs.readFileSync(manifestPath, 'utf-8') === cjkChars.join('');
    const chunks = [];
    for (let i = 0; i < cjkChars.length; i += CJK.chunkSize)
      chunks.push(cjkChars.slice(i, i + CJK.chunkSize));
    for (let ci = 0; ci < chunks.length; ci++) {
      const chunk = chunks[ci];
      const localName = `${CJK.filePrefix}-${CJK.weight}-cjk-${ci + 1}.woff2`;
      const dest = path.join(FONTS_DIR, localName);
      if (manifestSame && fs.existsSync(dest)) {
        console.log(`  • ${localName} (exists) [${chunk.length} chars]`);
      } else {
        const url =
          `https://fonts.googleapis.com/css2?family=${CJK.family.replace(/ /g, '+')}` +
          `:wght@${CJK.weight}&display=swap&text=${encodeURIComponent(chunk.join(''))}`;
        const res = await fetch(url, { headers: FETCH_HEADERS });
        if (!res.ok) throw new Error(`CSS2 ${CJK.family} chunk ${ci + 1} HTTP ${res.status}`);
        const faces = parseFaces(await res.text());
        if (!faces.length || !faces[0].url)
          throw new Error(`${CJK.family} chunk ${ci + 1}: no woff2 in response`);
        const size = await download(faces[0].url, dest);
        console.log(`  ✓ ${localName} (${size} B) [${chunk.length} chars]`);
      }
      allFaces.push({
        family: CJK.family,
        weight: String(CJK.weight),
        subset: `cjk-${ci + 1}`,
        style: 'normal',
        display: 'swap',
        unicodeRange: codepointsToRange(chunk),
        localPath: `/fonts/${localName}`,
      });
    }
    fs.writeFileSync(manifestPath, cjkChars.join(''));
    console.log(`${CJK.family}: ${cjkChars.length} chars → ${chunks.length} chunk(s)`);
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
  try {
    writeFallbackCss(`unexpected: ${(err && err.message) || err}`);
  } catch {
    /* fallback write failed — stay non-blocking */
  }
  console.error('✗ self-host-fonts failed (non-blocking):', err);
  // 不 exit(1)：prebuild 失败时让 astro build 继续（系统字体回退）
});
