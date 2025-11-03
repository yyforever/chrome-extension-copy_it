# Copy It - Chrome 扩展

解决部分网站禁止复制文本的问题，支持历史记录和批量合并复制。

## 功能特性

- **突破复制限制**：在任何网站上选中文本并复制
- **浮窗操作**：常驻可拖动浮窗，方便快捷
- **历史记录**：自动保存最近 10 条复制记录
- **批量合并**：支持多选历史记录并合并复制
- **智能检测**：自动检测选区状态，≥2 字符即可激活
- **多重兜底**：Clipboard API → Offscreen Document → 手动复制

## 技术栈

- **平台**：Chrome Extensions Manifest V3
- **架构**：
  - Content Script：页面侧 UI 与逻辑
  - Service Worker：消息中转
  - Offscreen Document：剪贴板写入兜底
- **核心 API**：
  - Selection API：选区捕获
  - Clipboard API：剪贴板操作
  - Shadow DOM：样式隔离
  - Chrome Extensions API：消息通信

## 项目结构

```
/
├── manifest.json           # 扩展配置文件
├── icons/                  # 图标资源
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── background/
│   │   └── service-worker.js       # Service Worker
│   ├── content/
│   │   ├── content-script.js       # 主入口
│   │   ├── FloatingButton.js       # 浮窗组件
│   │   ├── Menu.js                 # 菜单组件
│   │   ├── SelectionManager.js     # 选区管理
│   │   └── HistoryManager.js       # 历史管理
│   ├── offscreen/
│   │   ├── offscreen.html          # Offscreen 文档
│   │   └── offscreen.js            # Offscreen 脚本
│   ├── styles/
│   │   ├── floating-button.css     # 浮窗样式
│   │   └── menu.css                # 菜单样式
│   └── utils/
│       └── constants.js            # 常量定义
└── README.md
```

## 安装和使用

### 开发模式安装

1. 克隆或下载此项目
2. 准备图标文件（参见 `icons/README.md`）
3. 打开 Chrome 浏览器，进入 `chrome://extensions/`
4. 开启右上角的"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择项目根目录

### 使用方法

1. **选中文本**：在任意网页上选中文本（≥2 字符）
2. **点击浮窗**：右上角的浮窗会高亮，点击即可复制
3. **查看历史**：点击浮窗打开菜单，查看最近 10 条复制记录
4. **批量复制**：勾选多条历史记录，点击"全部复制"合并复制
5. **拖动浮窗**：可拖动浮窗到任意位置，自动吸附边缘

## 功能说明

### 复制限制

- 单条复制：≤1000 字符
- 超出限制：提供手动复制框
- 历史记录：最多 10 条（不去重）
- 生命周期：当前标签页内保留

### 浮窗状态

- **Idle**：灰态，30% 不透明度
- **Active**：检测到选区，高亮发光
- **Success**：复制成功，短暂绿色闪烁

### 菜单功能

- **反馈条**：显示复制结果（成功/失败/无选区）
- **历史列表**：显示最近 10 条记录，可展开查看全文
- **勾选排序**：按勾选顺序显示序号（①②③…）
- **合并复制**：使用换行符分隔，末尾保留一个换行

## 开发说明

### 常量配置

所有可配置的常量都在 `src/utils/constants.js` 中定义：

- `MIN_SELECTION_LENGTH`: 最小选区长度（默认 2）
- `MAX_SINGLE_COPY_LENGTH`: 单条最大长度（默认 1000）
- `MAX_HISTORY_COUNT`: 历史记录数量（默认 10）

### 修改样式

- 浮窗样式：`src/content/FloatingButton.js` 中的 `getStyles()` 方法
- 菜单样式：`src/content/Menu.js` 中的 `getStyles()` 方法

### 调试

1. 打开 Chrome DevTools
2. Content Script：在页面中调试（Console 标签）
3. Service Worker：在 `chrome://extensions/` 中点击"Service Worker"调试
4. Offscreen：在 `chrome://extensions/` 中查看 Offscreen 文档

## 待办事项

- [ ] 添加实际图标资源
- [ ] 添加快捷键支持
- [ ] 添加设置页面（调整限制、样式等）
- [ ] 支持跨标签页历史记录同步
- [ ] 添加导出历史记录功能
- [ ] 国际化支持（i18n）

## 已知问题

1. 部分网站可能阻止 Shadow DOM，导致浮窗无法显示
2. Offscreen API 在某些情况下可能失败
3. 拖动浮窗时可能与页面元素冲突

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
