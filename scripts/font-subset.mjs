#!/usr/bin/env node

/**
 * 字体子集化工具
 * 用于创建包含中文字符的优化字体文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 项目常用中文字符集
const commonChineseChars =
  '的了一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管属件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞';

// 常用英文字符集
const commonLatinChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~';

// 标点符号
const punctuation = '，。！？；：""\'\'（）【】《》〈〉「」『』〔〕…—–·';

// 完整字符集
const fullCharset = commonChineseChars + commonLatinChars + punctuation;

// 生成字符集文件
function generateCharset() {
  const charsetDir = path.join(__dirname, '../public/fonts');

  if (!fs.existsSync(charsetDir)) {
    fs.mkdirSync(charsetDir, { recursive: true });
  }

  // 生成字符集文件
  fs.writeFileSync(path.join(charsetDir, 'charset.txt'), fullCharset.trim());

  console.log('✅ 字符集文件已生成:', path.join(charsetDir, 'charset.txt'));
  console.log('📊 字符集统计:');
  console.log(`   - 中文字符: ${commonChineseChars.trim().length} 个`);
  console.log(`   - 英文字符: ${commonLatinChars.trim().length} 个`);
  console.log(`   - 标点符号: ${punctuation.trim().length} 个`);
  console.log(`   - 总计: ${fullCharset.trim().length} 个字符`);
}

// 生成字体子集化命令
function generateSubsetCommands() {
  const commands = `# 字体子集化命令示例
# 需要安装 pyftsubset (fonttools)

# Inter 字体子集化
pyftsubset fonts/Inter-Regular.ttf \\
  --unicodes-file=public/fonts/charset.txt \\
  --output-file=public/fonts/inter-subset.woff2 \\
  --flavor=woff2 \\
  --layout-features='*' \\
  --glyph-names \\
  --symbol-cmap \\
  --name-IDs='*'

# Inter Bold 字体子集化
pyftsubset fonts/Inter-Bold.ttf \\
  --unicodes-file=public/fonts/charset.txt \\
  --output-file=public/fonts/inter-bold-subset.woff2 \\
  --flavor=woff2 \\
  --layout-features='*' \\
  --glyph-names \\
  --symbol-cmap \\
  --name-IDs='*'

# Lora 字体子集化
pyftsubset fonts/Lora-Regular.ttf \\
  --unicodes-file=public/fonts/charset.txt \\
  --output-file=public/fonts/lora-subset.woff2 \\
  --flavor=woff2 \\
  --layout-features='*' \\
  --glyph-names \\
  --symbol-cmap \\
  --name-IDs='*'

# Noto Sans SC 字体子集化
pyftsubset fonts/NotoSansSC-Regular.ttf \\
  --unicodes-file=public/fonts/charset.txt \\
  --output-file=public/fonts/noto-sans-sc-subset.woff2 \\
  --flavor=woff2 \\
  --layout-features='*' \\
  --glyph-names \\
  --symbol-cmap \\
  --name-IDs='*'`;

  fs.writeFileSync(path.join(__dirname, '../scripts/font-subset-commands.txt'), commands.trim());

  console.log(
    '✅ 字体子集化命令已生成:',
    path.join(__dirname, '../scripts/font-subset-commands.txt')
  );
}

// 主函数
function main() {
  console.log('🔧 开始字体子集化配置...\n');

  generateCharset();
  generateSubsetCommands();

  console.log('\n📝 下一步操作:');
  console.log('1. ✅ fonttools 已安装');
  console.log('2. 📥 下载原始字体文件到 fonts/ 目录');
  console.log('3. 🔧 运行子集化命令: sh scripts/font-subset-commands.txt');
  console.log('4. 🎨 更新 CSS 中的字体引用');
}

main();

export { generateCharset, generateSubsetCommands, fullCharset };
