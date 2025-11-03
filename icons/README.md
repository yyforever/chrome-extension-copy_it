# 图标文件说明

## 📦 图标文件

| 文件 | 尺寸 | 用途 | 格式 |
|------|------|------|------|
| `icon.svg` | 矢量 | 源文件 | SVG（可缩放矢量图形）|
| `icon16.png` | 16×16 | Chrome 工具栏 | PNG 16-bit RGBA |
| `icon48.png` | 48×48 | Chrome 扩展管理页 | PNG 16-bit RGBA |
| `icon128.png` | 128×128 | Chrome Web Store | PNG 16-bit RGBA |

## 🎨 图标设计

**主题**：剪贴板图标

**配色**：
- 主色：蓝色 `#3b82f6`（Chrome 扩展风格）
- 背景：圆形，透明度支持
- 细节：剪贴板夹子、文字线条

**设计元素**：
- 圆形背景 - 友好、现代
- 剪贴板图标 - 清晰表达「复制」功能
- 文字线条 - 暗示文本内容
- 简洁设计 - 易于识别

## 🔧 重新生成图标

### 方法 1：ImageMagick（推荐）

**优点**：高质量、支持透明度、抗锯齿

```bash
# 确保已安装 ImageMagick 7.x
brew install imagemagick  # macOS
# 或
sudo apt-get install imagemagick  # Ubuntu

# 生成图标
cd /path/to/project
./generate_icons_imagemagick.sh
```

**生成参数**：
- 背景：透明（`-background none`）
- 渲染密度：300 DPI（`-density 300`）
- 质量：100%（`-quality 100`）
- 格式：16-bit RGBA

### 方法 2：Python + Pillow

**优点**：跨平台、依赖简单

```bash
# 确保已安装 Pillow
pip3 install Pillow

# 生成图标
python3 generate_icons.py
```

**生成参数**：
- 背景：蓝色（`#3b82f6`）
- 格式：8-bit RGB

## 📐 技术规格

### ImageMagick 版本（当前使用）

```
icon16.png:  1.5 KB, 16-bit/color RGBA
icon48.png:  3.3 KB, 16-bit/color RGBA
icon128.png: 7.8 KB, 16-bit/color RGBA
```

### Pillow 版本（备选）

```
icon16.png:  ~114 B, 8-bit/color RGB
icon48.png:  ~213 B, 8-bit/color RGB
icon128.png: ~465 B, 8-bit/color RGB
```

## 🎯 Chrome 扩展图标要求

根据 [Chrome 扩展文档](https://developer.chrome.com/docs/extensions/mv3/manifest/icons/)：

| 尺寸 | 最小要求 | 推荐 | 用途 |
|------|---------|------|------|
| 16×16 | ✓ | ✓ | 扩展页面的 favicon |
| 32×32 | - | ✓ | Windows 计算机需要 |
| 48×48 | ✓ | ✓ | 扩展管理页面 |
| 128×128 | ✓ | ✓ | 安装时和 Chrome Web Store |

**格式要求**：
- PNG 格式
- 透明背景推荐
- 清晰、易识别
- 不同尺寸保持一致的视觉效果

## 🔄 自定义图标

如果要自定义图标：

1. **编辑 SVG**：修改 `icon.svg`
   - 使用 Figma、Inkscape、Adobe Illustrator 等
   - 保持 128×128 的 viewBox
   - 使用简单的形状，避免复杂细节

2. **重新生成 PNG**：
   ```bash
   ./generate_icons_imagemagick.sh
   ```

3. **重新加载扩展**：
   - 访问 `chrome://extensions/`
   - 点击扩展的刷新按钮

## 📝 图标设计建议

- ✅ **简洁清晰** - 16×16 时仍可识别
- ✅ **配色协调** - 符合品牌色彩
- ✅ **含义明确** - 一眼看出功能
- ✅ **边缘平滑** - 抗锯齿处理
- ❌ **避免文字** - 小尺寸难以阅读
- ❌ **避免复杂** - 细节在小尺寸丢失

## 🙏 图标来源

本项目图标为原创设计，基于剪贴板/复制功能的通用视觉语言。

如需使用其他图标库：
- [Heroicons](https://heroicons.com/) - Tailwind CSS 官方图标
- [Font Awesome](https://fontawesome.com/) - 经典图标库
- [Material Icons](https://fonts.google.com/icons) - Google 设计
