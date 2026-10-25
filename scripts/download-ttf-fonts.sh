#!/bin/bash

# 下载TTF格式字体文件
echo "🔧 下载TTF格式字体文件..."

# 创建字体目录
mkdir -p fonts

# 下载 Inter TTF 字体
echo "📥 下载 Inter TTF 字体..."
curl -L -o fonts/Inter-Regular.ttf "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf"
curl -L -o fonts/Inter-Bold.ttf "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.ttf"

# 下载 Lora TTF 字体
echo "📥 下载 Lora TTF 字体..."
curl -L -o fonts/Lora-Regular.ttf "https://fonts.gstatic.com/s/lora/v26/0QIvMX1D_JOuMw7Bau9CwsGEHc5A.ttf"

# 下载 Noto Sans SC TTF 字体
echo "📥 下载 Noto Sans SC TTF 字体..."
curl -L -o fonts/NotoSansSC-Regular.ttf "https://fonts.gstatic.com/s/notosanssc/v36/k3kXo84MPvpLmixcA63oeALZTYKLgWSUQyA9RRmI6pBmFmqQ.ttf"

echo "✅ TTF字体下载完成!"
echo "📁 字体文件位置: fonts/"
ls -la fonts/

echo ""
echo "🔧 下一步: 运行字体子集化命令"
echo "sh scripts/font-subset-commands.txt"
