#!/bin/bash

# 🎨 宁静品牌图标生成脚本
# 从SVG生成多尺寸PNG和ICO文件

# 检查是否安装了 ImageMagick
if ! command -v convert >/dev/null 2>&1; then
    echo "⚠️ 警告: 未找到 convert 命令 (ImageMagick)。"
    echo "💡 在 Cloudflare Pages 上构建时将跳过图标生成，使用已有的静态图标。"
    exit 0
fi

echo "🎨 开始生成宁静品牌图标..."

# 创建图标目录
mkdir -p public/icons

# 从SVG生成多尺寸PNG
echo "📸 生成PNG图标..."
for size in 16 32 48 64 128 192 512; do
    if [ $size -eq 16 ]; then
        # 使用16×16优化版本
        convert -background none -resize ${size}x${size} public/favicon-16.svg public/icons/icon-${size}.png
    else
        # 使用标准版本
        convert -background none -resize ${size}x${size} public/favicon.svg public/icons/icon-${size}.png
    fi
    echo "✅ 生成 icon-${size}.png"
done

# 生成ICO文件（16,32,48）
echo "🔧 生成ICO文件..."
convert public/icons/icon-16.png public/icons/icon-32.png public/icons/icon-48.png public/favicon.ico
echo "✅ 生成 favicon.ico"

# 生成苹果设备图标（180×180）
echo "🍎 生成苹果设备图标..."
convert -background none -resize 180x180 public/favicon.svg public/apple-touch-icon.png
echo "✅ 生成 apple-touch-icon.png"

# 复制SVG到icons目录
cp public/favicon.svg public/icons/
cp public/favicon-16.svg public/icons/

echo "🎉 所有图标生成完成！"
echo ""
echo "📁 生成的文件："
echo "  - public/favicon.ico (16,32,48)"
echo "  - public/favicon.svg (矢量)"
echo "  - public/apple-touch-icon.png (180×180)"
echo "  - public/icons/icon-*.png (多尺寸)"
echo ""
echo "🌙 宁静品牌图标系统已就绪！"
