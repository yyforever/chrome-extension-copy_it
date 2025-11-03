# 图标说明

请在此目录下放置以下图标文件：

- `icon16.png` - 16x16 像素
- `icon48.png` - 48x48 像素
- `icon128.png` - 128x128 像素

## 快速生成（推荐）

本目录已包含 `icon.svg` 文件，你可以使用以下方法转换为 PNG：

### 方法 1：在线转换（最简单）

1. 访问 https://cloudconvert.com/svg-to-png
2. 上传 `icon.svg`
3. 设置输出尺寸为 16x16、48x48、128x128
4. 下载并重命名为 `icon16.png`、`icon48.png`、`icon128.png`

### 方法 2：使用 ImageMagick（命令行）

```bash
# 安装 ImageMagick (macOS)
brew install imagemagick

# 生成图标
convert -background none -resize 16x16 icon.svg icon16.png
convert -background none -resize 48x48 icon.svg icon48.png
convert -background none -resize 128x128 icon.svg icon128.png
```

### 方法 3：使用 Chrome 浏览器

1. 在 Chrome 中打开 `icon.svg`
2. 右键 → 检查 → Console
3. 运行以下代码（分别设置不同尺寸）：

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const img = document.querySelector('svg');
const size = 128; // 改为 16, 48, 128
canvas.width = size;
canvas.height = size;
const data = new XMLSerializer().serializeToString(img);
const blob = new Blob([data], {type: 'image/svg+xml'});
const url = URL.createObjectURL(blob);
const image = new Image();
image.onload = () => {
  ctx.drawImage(image, 0, 0, size, size);
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `icon${size}.png`;
    a.click();
  });
};
image.src = url;
```

## 临时解决方案

如果暂时无法生成图标，可以使用任意 PNG 图片重命名为对应文件名，扩展仍可正常加载。

## 图标设计建议

- 使用剪贴板或复制相关的图标
- 背景色建议：蓝色 (#3b82f6) 或透明
- 主题色建议：白色或浅色
- 风格：简洁、现代、扁平化
