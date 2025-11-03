# 快速开始指南

## 1. 生成图标（必需）

在加载扩展之前，你需要先生成图标文件。

### 最简单的方法：

```bash
cd icons

# 如果已安装 ImageMagick
brew install imagemagick  # macOS
convert -background none -resize 16x16 icon.svg icon16.png
convert -background none -resize 48x48 icon.svg icon48.png
convert -background none -resize 128x128 icon.svg icon128.png
```

或者使用在线工具：https://cloudconvert.com/svg-to-png

## 2. 加载扩展到 Chrome

1. 打开 Chrome 浏览器
2. 地址栏输入：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目的根目录

## 3. 测试扩展

1. 打开任意网页（如 https://example.com）
2. 在页面右上角应该能看到一个半透明的圆形浮窗
3. 选中页面上的一些文字（至少 2 个字符）
4. 浮窗会高亮并发光
5. 点击浮窗，选中的文字会被复制，并弹出菜单
6. 菜单中显示复制历史和操作按钮

## 4. 功能测试清单

- [ ] 浮窗显示在页面上
- [ ] 选中文字后浮窗高亮
- [ ] 点击浮窗能复制文字
- [ ] 菜单能正常打开和关闭
- [ ] 历史记录能正常显示
- [ ] 能勾选多条历史并合并复制
- [ ] 浮窗能拖动并吸附边缘
- [ ] 点击菜单外部能关闭菜单
- [ ] ESC 键能关闭菜单

## 5. 调试技巧

### 查看 Console 输出

- **Content Script 日志**：
  1. 打开任意网页
  2. 按 F12 打开 DevTools
  3. 在 Console 中应该能看到 "Copy It initialized"

- **Service Worker 日志**：
  1. 打开 `chrome://extensions/`
  2. 找到 "Copy It" 扩展
  3. 点击 "Service Worker" 链接
  4. 查看 Console 输出

### 常见问题

**Q: 浮窗不显示？**
- 检查是否成功加载扩展
- 刷新页面试试
- 查看 Console 是否有错误

**Q: 点击浮窗没反应？**
- 确保选中了至少 2 个字符
- 检查 Console 是否有错误
- 尝试重新选中文字

**Q: 复制失败？**
- 检查是否超过 1000 字符限制
- 查看是否有手动复制框
- 检查浏览器剪贴板权限

**Q: 图标显示错误？**
- 确保已生成 icon16.png、icon48.png、icon128.png
- 检查图标文件是否在 icons/ 目录下
- 重新加载扩展

## 6. 下一步

- 修改 `src/utils/constants.js` 调整各种限制
- 修改组件样式以适应你的需求
- 添加更多功能（参考 README.md 中的待办事项）

## 7. 开发建议

1. **实时调试**：修改代码后，在 `chrome://extensions/` 点击刷新按钮，然后刷新测试页面
2. **日志输出**：在关键位置添加 `console.log()` 查看执行流程
3. **Shadow DOM 调试**：在 DevTools 中启用 "Show user agent shadow DOM"
4. **性能优化**：注意避免频繁的 DOM 操作和重渲染

祝开发愉快！
