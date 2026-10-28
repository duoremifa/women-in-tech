import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const REPORT_FILE = path.join(ROOT_DIR, 'font-audit-report.md');
const JSON_FILE = path.join(ROOT_DIR, 'font-audit.json');

const PATTERNS = [/\.astro$/, /\.css$/, /\.tsx?$/];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      const fullPath = path.join(dirPath, file);
      const isMatch = PATTERNS.some(p => p.test(fullPath));
      if (isMatch) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(SRC_DIR);
const results = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(ROOT_DIR, file);

  lines.forEach((line, idx) => {
    // Audit for font-size, font-weight, font-family
    // Simple regex, might miss multi-line but good enough for audit
    const match = line.match(/(font-(size|family|weight)\s*:\s*)([^;]+);/i);
    if (match) {
      const prop = match[2].trim().toLowerCase(); // size, family, weight
      const value = match[3].trim();
      const isVar = /var\(--.+\)/.test(value);

      // Filter out "good" usages if we want, but let's keep all to calculate stats
      results.push({
        file: relativePath,
        line: idx + 1,
        property: `font-${prop}`,
        value: value,
        isVariable: isVar,
      });
    }
  });
});

// Generate Markdown Report
let md = '# 🏗️ 字体体系审计报告\n\n';
md += `生成时间: ${new Date().toLocaleString()}\n`;
md += `扫描文件数: ${allFiles.length}\n`;
md += `发现声明数: ${results.length}\n\n`;

const total = results.length;
const variableUsage = results.filter(r => r.isVariable).length;
const hardcoded = total - variableUsage;
const percentage = total > 0 ? ((variableUsage / total) * 100).toFixed(1) : 0;

md += `| 总计声明 | 使用变量 (✅) | 硬编码 (❌) | 变量覆盖率 |\n`;
md += `| :---: | :---: | :---: | :---: |\n`;
md += `| ${total} | ${variableUsage} | ${hardcoded} | ${percentage}% |\n\n`;

md += `## ❌ 硬编码清单 (亟需修复)\n\n`;
md += `| 文件 | 行号 | 属性 | 当前值 | 建议 |\n`;
md += `| --- | :---: | --- | --- | --- |\n`;

results
  .filter(r => !r.isVariable)
  .forEach(r => {
    let suggestion = '';
    if (r.property === 'font-size') {
      if (r.value.includes('1.5rem')) suggestion = 'var(--font-size-2xl)';
      else if (r.value.includes('2rem')) suggestion = 'var(--font-size-3xl)';
      else if (r.value.includes('1rem')) suggestion = 'var(--font-size-base)';
      else if (r.value.includes('0.875rem')) suggestion = 'var(--font-size-sm)';
    } else if (r.property === 'font-weight') {
      if (r.value.includes('600') || r.value.includes('bold'))
        suggestion = 'var(--font-weight-bold)';
      else if (r.value.includes('400') || r.value.includes('normal'))
        suggestion = 'var(--font-weight-normal)';
    }

    // Clean up value for table
    const cleanValue = r.value.replace(/`/g, '');
    md += `| \`${r.file}\` | ${r.line} | \`${r.property}\` | \`${cleanValue}\` | \`${suggestion}\` |\n`;
  });

fs.writeFileSync(JSON_FILE, JSON.stringify(results, null, 2));
fs.writeFileSync(REPORT_FILE, md);

console.log('Audit complete.');
console.log('JSON:', JSON_FILE);
console.log('Report:', REPORT_FILE);
