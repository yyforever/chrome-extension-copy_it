# Bug 修复：浮窗点击后位置跳变

## 问题描述

**现象**：浮窗初始出现在右上角（`top: 16, right: 16`），点击后会跳到左上角。

**影响**：用户体验差，点击一次浮窗就会改变位置，需要重新拖拽回原位。

## 根本原因分析

### 问题流程

1. **初始状态**
   - 浮窗位置：`{ top: 16, right: 16 }` （右上角）
   - CSS 定位：`top: 16px; right: 16px;`

2. **用户点击浮窗**
   - `mousedown` 事件触发 → `onDragStart()` 被调用
   - 设置 `isDragging = true`
   - 计算拖拽偏移量并记录

3. **微小的鼠标移动**
   - 人手点击时很难完全不移动（哪怕 1-2 像素）
   - `mousemove` 事件触发 → `onDrag()` 被调用

4. **位置被错误修改**（核心问题）
   ```javascript
   // onDrag() 方法中
   this.position.left = Math.max(0, Math.min(x, maxX));  // 设置 left
   this.position.top = Math.max(0, Math.min(y, maxY));   // 保留 top

   delete this.position.right;   // ❌ 删除 right 属性
   delete this.position.bottom;  // ❌ 删除 bottom 属性
   ```

   - 原来：`{ top: 16, right: 16 }` → CSS: `top: 16px; right: 16px;`
   - 现在：`{ top: 16, left: ??? }` → CSS: `top: 16px; left: ???px;`
   - `right` 被删除，改用 `left` 定位，位置计算错误

5. **吸附逻辑加剧问题**
   - `mouseup` 触发 `onDragEnd()` → 调用 `snapToEdge()`
   - 由于定位方式已改变，吸附判断可能出错
   - 最终浮窗跑到错误的位置

### 核心问题

**没有区分"点击"和"拖拽"**：
- **点击**：`mousedown` → `mouseup`，鼠标位置几乎不变（< 5px）
- **拖拽**：`mousedown` → `mousemove`（移动距离 ≥ 5px） → `mouseup`

原代码把**任何 `mousedown` 都当作拖拽的开始**，即使只是点击也会修改位置定位方式。

## 解决方案

### 核心思路

添加**拖拽距离阈值**：只有当鼠标移动超过一定距离（5px）时，才认为是真正的拖拽。

### 修改内容

#### 1. 添加属性（FloatingButton.js:7-10）

```javascript
this.hasMoved = false;                    // 是否真正移动过
this.dragStartPos = { x: 0, y: 0 };      // 拖拽开始时的鼠标位置
this.dragThreshold = 5;                   // 拖拽距离阈值（像素）
```

#### 2. 修改 `onDragStart()`（FloatingButton.js:167-180）

```javascript
onDragStart(e) {
  this.isDragging = true;
  this.hasMoved = false; // 重置移动标记

  // 记录初始鼠标位置
  this.dragStartPos.x = e.clientX;
  this.dragStartPos.y = e.clientY;

  const rect = this.container.getBoundingClientRect();
  this.dragOffset.x = e.clientX - rect.left;
  this.dragOffset.y = e.clientY - rect.top;

  e.preventDefault();
}
```

**关键变化**：
- 记录初始鼠标位置 `dragStartPos`
- 重置 `hasMoved = false`
- **移除**了添加 'dragging' 类的代码（延迟到真正开始拖拽时）

#### 3. 修改 `onDrag()`（FloatingButton.js:183-217）

```javascript
onDrag(e) {
  if (!this.isDragging) return;

  // 计算鼠标移动距离
  const deltaX = e.clientX - this.dragStartPos.x;
  const deltaY = e.clientY - this.dragStartPos.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // 只有移动距离超过阈值才认为是真正的拖拽
  if (!this.hasMoved && distance < this.dragThreshold) {
    return; // ✅ 提前退出，不修改位置
  }

  // 第一次超过阈值，标记为已移动并添加拖拽样式
  if (!this.hasMoved) {
    this.hasMoved = true;
    const button = this.shadowRoot.querySelector('.floating-button');
    button.classList.add('dragging');
  }

  // ... 原有的位置更新逻辑
}
```

**关键变化**：
- 计算鼠标移动距离（欧几里得距离）
- 距离 < 5px 时直接返回，**不修改位置**
- 首次超过阈值时才标记 `hasMoved = true` 并添加拖拽样式

#### 4. 修改 `onDragEnd()`（FloatingButton.js:220-236）

```javascript
onDragEnd() {
  if (!this.isDragging) return;

  this.isDragging = false;

  // 只有真正拖拽过才需要移除拖拽样式和执行吸附
  if (this.hasMoved) {
    const button = this.shadowRoot.querySelector('.floating-button');
    button.classList.remove('dragging');

    // 吸附到边缘
    this.snapToEdge();
  }

  // 重置移动标记
  this.hasMoved = false;
}
```

**关键变化**：
- 只有 `hasMoved === true` 时才执行吸附逻辑
- 点击时不会调用 `snapToEdge()`，保持原位置不变

## 效果对比

### 修复前

| 操作 | 结果 |
|------|------|
| 点击浮窗 | ❌ 位置从右上角跳到左上角 |
| 拖拽浮窗 | ✅ 可以拖动并吸附 |

### 修复后

| 操作 | 结果 |
|------|------|
| 点击浮窗 | ✅ 位置保持不变（仅触发点击事件） |
| 拖拽浮窗（移动 < 5px） | ✅ 视为点击，位置不变 |
| 拖拽浮窗（移动 ≥ 5px） | ✅ 正常拖动并吸附边缘 |

## 测试步骤

### 1. 重新加载扩展

```bash
# 在 Chrome 中
1. 打开 chrome://extensions/
2. 找到 "Copy It" 扩展
3. 点击刷新按钮 ⟳
4. 刷新测试网页
```

### 2. 测试点击不跳变

- [ ] 浮窗默认出现在右上角
- [ ] 点击浮窗一次
- [ ] ✅ 浮窗仍在右上角，没有跳到左上角
- [ ] 弹出菜单正常
- [ ] 多次点击，位置始终不变

### 3. 测试拖拽功能

- [ ] 按住浮窗并拖动（移动超过 5px）
- [ ] ✅ 浮窗跟随鼠标移动
- [ ] ✅ 添加了 'dragging' 样式（光标变化）
- [ ] 松开鼠标
- [ ] ✅ 浮窗吸附到最近的边缘

### 4. 测试微小移动

- [ ] 按住浮窗但只移动 1-2 像素
- [ ] ✅ 浮窗不会移动
- [ ] ✅ 视为点击，弹出菜单

## 技术细节

### 拖拽距离计算

使用欧几里得距离公式：

```javascript
distance = √(Δx² + Δy²)
```

其中：
- `Δx = 当前鼠标X - 初始鼠标X`
- `Δy = 当前鼠标Y - 初始鼠标Y`

### 阈值选择

选择 **5px** 作为阈值的原因：
- 小于 5px：人类点击时的自然抖动范围
- 大于等于 5px：明确的拖拽意图

这个值可以通过 `this.dragThreshold` 调整。

### 状态机

```
[mousedown] → isDragging=true, hasMoved=false
     ↓
[mousemove, distance < 5px] → 保持位置，等待
     ↓
[mousemove, distance ≥ 5px] → hasMoved=true, 开始拖拽
     ↓
[mouseup, hasMoved=true] → 执行吸附
[mouseup, hasMoved=false] → 不执行吸附（视为点击）
```

## 相关文件

- `src/content/FloatingButton.js` - 修改的主要文件
- `src/utils/constants.js` - 常量定义（未修改）

## 代码变更统计

- 新增属性：3 个
- 修改方法：3 个
- 新增代码行：约 20 行
- 修改代码行：约 15 行

## 参考资料

- [拖拽阈值最佳实践](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [鼠标事件处理](https://javascript.info/mouse-drag-and-drop)

## 总结

通过引入拖拽距离阈值，成功区分了"点击"和"拖拽"两种操作，彻底解决了点击时位置跳变的问题。这是一个常见的 UI 交互 bug，修复方案简洁且有效。
