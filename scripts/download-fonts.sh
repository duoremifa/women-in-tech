#!/bin/bash

# 字体下载脚本
# 下载项目所需的字体文件

echo "🔧 开始下载字体文件..."

# 创建字体目录
mkdir -p fonts

# 下载 Inter 字体
echo "📥 下载 Inter 字体..."
curl -L -o fonts/Inter-Regular.ttf "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
curl -L -o fonts/Inter-Bold.ttf "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2"

# 下载 Lora 字体
echo "📥 下载 Lora 字体..."
curl -L -o fonts/Lora-Regular.ttf "https://fonts.gstatic.com/s/lora/v26/0QIvMX1D_JOuMw7Bau9CwsGEHc5A.woff2"

# 下载 Noto Sans SC 字体
echo "📥 下载 Noto Sans SC 字体..."
curl -L -o fonts/NotoSansSC-Regular.ttf "https://fonts.gstatic.com/s/notosanssc/v36/k3kXo84MPvpLmixcA63oeALZTYKLgWSUQyA9RRmI6pBmFmqQ.woff2"

echo "✅ 字体下载完成!"
echo "📁 字体文件位置: fonts/"
echo "📋 下载的字体:"
ls -la fonts/

echo ""
echo "🔧 下一步: 运行字体子集化命令"
echo "sh scripts/font-subset-commands.txt"
