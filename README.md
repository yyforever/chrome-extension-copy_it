# Copy It - 解除网页复制限制

<div align="center">

**🚀 一键解除网页复制限制，支持历史记录和批量合并复制**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[功能特性](#功能特性) • [安装使用](#安装使用) • [技术架构](#技术架构) • [开发指南](#开发指南)

</div>

---

## 📋 功能特性

### 核心功能

- **🔓 突破复制限制** - 在任何网站上自由复制文本，无视网页的复制限制
- **📍 浮动按钮** - 常驻可拖动浮窗，选中文字后一键复制
- **📝 历史记录** - 自动保存最近 10 条复制记录，随时查看和管理
- **📦 批量合并** - 支持多选历史记录并合并复制，自动换行分隔
- **🎯 智能检测** - 自动检测选区状态，≥2 字符即可激活
- **🔄 多重兜底** - Clipboard API → Offscreen Document → 手动复制框

### 用户体验

- **✨ 无闪烁交互** - 增量更新 UI，复选框操作流畅自然
- **🎨 样式隔离** - 使用 Shadow DOM，不影响网页原有样式
- **🖱️ 拖拽定位** - 浮窗可自由拖动，智能区分点击和拖拽
- **💬 即时反馈** - 复制成功/失败即时提示，状态清晰明了

---

## 🚀 安装使用

### 从源码安装（开发模式）

1. **克隆项目**
   ```bash
   git clone https://github.com/你的用户名/chrome-extension-copy_it.git
   cd chrome-extension-copy_it
   ```

2. **生成图标**（首次安装需要）
   ```bash
   python3 generate_icons.py
   ```

3. **加载扩展**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择项目根目录

### 使用方法

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1️⃣ | 选中文本 | 在任意网页选中 ≥2 个字符 |
| 2️⃣ | 点击浮窗 | 右上角的浮窗会高亮，点击即可复制 |
| 3️⃣ | 查看历史 | 点击浮窗打开菜单，查看最近 10 条记录 |
| 4️⃣ | 批量复制 | 勾选多条记录，点击「全部复制」 |
| 5️⃣ | 展开查看 | 点击历史记录可展开查看完整内容 |

### 浮窗状态说明

| 状态 | 外观 | 说明 |
|------|------|------|
| 🌑 Idle | 灰色，30% 不透明度 | 未检测到选区 |
| ✨ Active | 蓝色发光，脉动动画 | 检测到有效选区 |
| ✅ Success | 绿色闪烁 | 复制成功（2秒后恢复） |

---

## 🏗️ 技术架构

### 技术栈

```
Chrome Extensions MV3
├── Content Script      # 页面侧 UI 与逻辑
├── Service Worker      # 后台消息中转
├── Offscreen Document  # 剪贴板兜底方案
└── Shadow DOM          # 样式隔离
```

### 核心 API

- **Selection API** - 捕获用户选区
- **Clipboard API** - 主要的剪贴板写入方式
- **Shadow DOM** - 隔离扩展样式，避免与网页冲突
- **Chrome Extensions API** - 消息通信、Offscreen 管理

### 项目结构

```
chrome-extension-copy_it/
├── manifest.json                 # MV3 配置文件
├── icons/                        # 图标资源
│   ├── icon.svg                  # 矢量图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── background/
│   │   └── service-worker.js     # 后台服务
│   ├── content/
│   │   ├── content-script.js     # 主入口
│   │   ├── FloatingButton.js     # 浮窗组件
│   │   ├── Menu.js               # 菜单组件（历史、批量复制）
│   │   ├── SelectionManager.js   # 选区检测与管理
│   │   └── HistoryManager.js     # 历史记录管理
│   ├── offscreen/
│   │   ├── offscreen.html        # Offscreen 文档
│   │   └── offscreen.js          # 剪贴板兜底实现
│   └── utils/
│       └── constants.js          # 常量配置
├── generate_icons.py             # 图标生成脚本
└── README.md
```

### 技术亮点

#### 1. Shadow DOM 事件管理
- 事件不在 Shadow DOM 内部阻止冒泡
- 在 container 层统一阻止，防止误触发外部点击
- 正确处理 composed 事件的跨边界传播

#### 2. 增量更新优化
- 复选框切换：只更新徽标和按钮状态，不重新渲染整个菜单
- 展开/收起：只添加/移除展开内容，避免界面闪烁
- 菜单重新渲染后自动重新定位（`innerHTML` 会清除 inline style）

#### 3. 拖拽阈值检测
- 设置 5px 拖拽阈值，区分点击和拖动
- 避免点击浮窗时位置跳动

#### 4. 事件监听器管理
- 每次 `render()` 前移除旧监听器，避免累积
- 保存监听器引用，确保能正确移除

---

## 🔧 开发指南

### 常量配置

所有可配置的参数都在 `src/utils/constants.js`：

```javascript
const CONSTANTS = {
  MIN_SELECTION_LENGTH: 2,           // 最小选区长度
  MAX_SINGLE_COPY_LENGTH: 1000,      // 单条复制最大长度
  MAX_HISTORY_COUNT: 10,             // 历史记录数量
  FLOATING_BUTTON: {
    SIZE: 48,                         // 浮窗大小
    INITIAL_POSITION: { top: 16, right: 16 }
  },
  MENU: {
    WIDTH: 384,                       // 菜单宽度
    MAX_HEIGHT: 480,                  // 菜单最大高度
    OFFSET_FROM_BUTTON: 8
  }
};
```

### 修改样式

样式使用 CSS-in-JS，内联在组件中：

- **浮窗样式**：`src/content/FloatingButton.js` → `getStyles()` 方法
- **菜单样式**：`src/content/Menu.js` → `getStyles()` 方法

### 调试方法

| 组件 | 调试位置 | 方法 |
|------|---------|------|
| Content Script | 网页 Console | F12 → Console |
| Service Worker | Extensions 页面 | `chrome://extensions/` → Service Worker |
| Offscreen | Extensions 页面 | `chrome://extensions/` → Offscreen |

### 常见开发任务

#### 调整复制长度限制
编辑 `src/utils/constants.js`：
```javascript
MAX_SINGLE_COPY_LENGTH: 2000  // 改为 2000 字符
```

#### 调整历史记录数量
编辑 `src/utils/constants.js`：
```javascript
MAX_HISTORY_COUNT: 20  // 改为 20 条
```

#### 修改浮窗颜色
编辑 `src/content/FloatingButton.js` 中的样式：
```css
.floating-button.active {
  background: rgba(34, 197, 94, 0.9);  /* 改为绿色 */
}
```

---

## 📝 功能说明

### 复制限制

| 项目 | 限制 | 超限处理 |
|------|------|----------|
| 单条复制 | ≤1000 字符 | 提供手动复制框 |
| 历史记录 | 最多 10 条 | FIFO 淘汰 |
| 记录去重 | 不去重 | 允许重复记录 |
| 生命周期 | 当前标签页 | 关闭标签页清空 |

### 菜单功能

- **反馈条** - 显示复制结果（成功 ✓ / 失败 ✕ / 无选区 ℹ️）
- **历史列表** - 最近 10 条记录，显示前 50 字符
- **展开查看** - 点击记录可展开查看完整内容
- **勾选排序** - 按勾选顺序显示序号（① ② ③ …）
- **合并复制** - 换行符分隔，末尾保留一个换行

---

## ❓ FAQ

<details>
<summary><b>Q: 为什么有些网站还是无法复制？</b></summary>

部分网站可能使用了以下技术阻止复制：
- 完全禁用 Selection API
- 使用 Canvas/SVG 渲染文字
- 在文本上覆盖透明层

这些情况下扩展也无法获取到选区。建议使用浏览器的「检查元素」功能手动复制。
</details>

<details>
<summary><b>Q: 浮窗可以隐藏吗？</b></summary>

当前版本不支持隐藏。未来可能添加设置页面，支持自定义浮窗行为。
</details>

<details>
<summary><b>Q: 历史记录会保存到云端吗？</b></summary>

不会。历史记录只保存在当前标签页的内存中，关闭标签页就会清空。未来可能添加跨标签页同步功能。
</details>

<details>
<summary><b>Q: 如何修改合并时的分隔符？</b></summary>

目前固定使用换行符（`\n`）。如需修改，可以编辑 `src/content/Menu.js` 中的 `handleCopyAll()` 方法。
</details>

---

## 🗺️ 路线图

### v1.0（当前版本）
- [x] 基础复制功能
- [x] 浮窗 UI
- [x] 历史记录
- [x] 批量合并复制
- [x] Shadow DOM 隔离
- [x] 增量更新优化

### v1.1（计划中）
- [ ] 快捷键支持（Ctrl+Shift+C）
- [ ] 设置页面（调整限制、样式、快捷键）
- [ ] 历史记录搜索功能
- [ ] 导出历史记录（JSON/TXT）

### v2.0（远期）
- [ ] 跨标签页历史同步（Chrome Storage）
- [ ] 国际化支持（i18n）
- [ ] 富文本复制（保留格式）
- [ ] OCR 识别（图片文字）

---

## 🐛 已知问题

1. **部分网站无法显示浮窗** - 网站可能阻止 Shadow DOM 或 Content Script
2. **Offscreen API 偶尔失败** - 某些情况下 Chrome 限制 Offscreen 文档创建
3. **拖动时可能与页面冲突** - 部分页面元素可能捕获鼠标事件

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交 Issue
- 🐛 Bug 报告：请提供复现步骤、浏览器版本、错误信息
- 💡 功能建议：请说明使用场景和预期效果
- ❓ 使用问题：请先查看 FAQ 和文档

### 提交 PR
1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代码规范
- 使用 2 空格缩进
- 函数和变量使用驼峰命名
- 添加必要的注释说明
- 保持代码简洁清晰

---

## 📄 许可证

本项目采用 [MIT License](https://opensource.org/licenses/MIT) 开源。

---

## 🙏 致谢

- 感谢 [Chrome Extensions 文档](https://developer.chrome.com/docs/extensions/mv3/)
- 感谢所有贡献者和用户的支持

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！**

Made with ❤️ by [Your Name]

</div>
