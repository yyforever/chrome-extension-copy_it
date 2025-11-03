#!/bin/bash

# 使用 ImageMagick 生成高质量图标
# 要求：ImageMagick 7.x 已安装

set -e

echo "🎨 正在使用 ImageMagick 生成高质量图标..."

cd icons

# 检查 ImageMagick 是否安装
if ! command -v magick &> /dev/null; then
    echo "❌ 错误：ImageMagick 未安装"
    echo "📦 请先安装 ImageMagick："
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# 检查 SVG 文件是否存在
if [ ! -f "icon.svg" ]; then
    echo "❌ 错误：找不到 icon.svg"
    exit 1
fi

# 生成不同尺寸的图标
# 参数说明：
# -background none: 透明背景
# -density 300: 高 DPI 渲染（提高质量）
# -resize: 调整到目标尺寸
# -quality 100: 最高质量

echo "📐 生成 16x16 图标..."
magick -background none -density 300 icon.svg -resize 16x16 -quality 100 icon16.png

echo "📐 生成 48x48 图标..."
magick -background none -density 300 icon.svg -resize 48x48 -quality 100 icon48.png

echo "📐 生成 128x128 图标..."
magick -background none -density 300 icon.svg -resize 128x128 -quality 100 icon128.png

echo ""
echo "✅ 图标生成成功！"
echo ""
echo "📊 文件信息："
ls -lh icon*.png

echo ""
echo "🎉 完成！图标已保存到 icons/ 目录"
