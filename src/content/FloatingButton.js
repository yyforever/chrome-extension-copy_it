// 浮窗按钮组件
class FloatingButton {
  constructor() {
    this.container = null;
    this.shadowRoot = null;
    this.isDragging = false;
    this.hasMoved = false; // 是否真正移动过
    this.dragOffset = { x: 0, y: 0 };
    this.dragStartPos = { x: 0, y: 0 }; // 拖拽开始时的鼠标位置
    this.dragThreshold = 5; // 拖拽距离阈值（像素）
    this.position = { ...CONSTANTS.FLOATING_BUTTON.DEFAULT_POSITION };
    this.state = 'idle'; // idle, active, success
    this.clickHandler = null;
  }

  // 初始化
  init() {
    this.createButton();
    this.attachEventListeners();
    this.setState('idle');
  }

  // 创建按钮
  createButton() {
    // 创建容器
    this.container = document.createElement('div');
    this.container.id = 'copy-it-floating-button';

    // 创建 Shadow DOM
    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });

    // 创建按钮元素
    const button = document.createElement('div');
    button.className = 'floating-button';

    // 创建图标
    const icon = this.createIcon();
    button.appendChild(icon);

    // 添加样式
    const style = document.createElement('style');
    style.textContent = this.getStyles();

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(button);

    // 添加到页面
    document.body.appendChild(this.container);

    // 设置初始位置
    this.updatePosition();
  }

  // 创建图标（SVG）
  createIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');

    // 剪贴板图标路径
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z');
    path.setAttribute('fill', 'currentColor');

    svg.appendChild(path);
    return svg;
  }

  // 获取样式
  getStyles() {
    return `
      .floating-button {
        width: ${CONSTANTS.FLOATING_BUTTON.SIZE}px;
        height: ${CONSTANTS.FLOATING_BUTTON.SIZE}px;
        border-radius: ${CONSTANTS.FLOATING_BUTTON.BORDER_RADIUS}px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .floating-button.idle {
        opacity: 0.3;
      }

      .floating-button.active {
        opacity: 1;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3),
                    0 4px 16px rgba(0, 0, 0, 0.2);
        animation: pulse 2s ease-in-out infinite;
      }

      .floating-button.success {
        opacity: 1;
        background: rgba(34, 197, 94, 0.9);
      }

      .floating-button:hover {
        transform: scale(1.05);
      }

      .floating-button.dragging {
        cursor: grabbing;
        opacity: 0.8;
      }

      .icon {
        color: white;
        pointer-events: none;
      }

      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3),
                      0 4px 16px rgba(0, 0, 0, 0.2);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2),
                      0 4px 16px rgba(0, 0, 0, 0.2);
        }
      }
    `;
  }

  // 设置状态
  setState(state) {
    this.state = state;
    const button = this.shadowRoot.querySelector('.floating-button');

    button.classList.remove('idle', 'active', 'success');
    button.classList.add(state);

    // Success 状态自动恢复
    if (state === 'success') {
      setTimeout(() => {
        this.setState('idle');
      }, CONSTANTS.ANIMATION.SUCCESS_FLASH);
    }
  }

  // 附加事件监听
  attachEventListeners() {
    const button = this.shadowRoot.querySelector('.floating-button');

    // 点击事件
    button.addEventListener('click', (e) => {
      if (!this.isDragging && this.clickHandler) {
        e.stopPropagation();
        this.clickHandler(e);
      }
    });

    // 拖拽事件
    button.addEventListener('mousedown', (e) => this.onDragStart(e));
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.onDragEnd());
  }

  // 开始拖拽
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

  // 拖拽中
  onDrag(e) {
    if (!this.isDragging) return;

    // 计算鼠标移动距离
    const deltaX = e.clientX - this.dragStartPos.x;
    const deltaY = e.clientY - this.dragStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 只有移动距离超过阈值才认为是真正的拖拽
    if (!this.hasMoved && distance < this.dragThreshold) {
      return;
    }

    // 第一次超过阈值，标记为已移动并添加拖拽样式
    if (!this.hasMoved) {
      this.hasMoved = true;
      const button = this.shadowRoot.querySelector('.floating-button');
      button.classList.add('dragging');
    }

    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;

    // 限制在视口内
    const maxX = window.innerWidth - CONSTANTS.FLOATING_BUTTON.SIZE;
    const maxY = window.innerHeight - CONSTANTS.FLOATING_BUTTON.SIZE;

    this.position.left = Math.max(0, Math.min(x, maxX));
    this.position.top = Math.max(0, Math.min(y, maxY));

    delete this.position.right;
    delete this.position.bottom;

    this.updatePosition();
  }

  // 结束拖拽
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

  // 吸附到边缘
  snapToEdge() {
    const threshold = CONSTANTS.FLOATING_BUTTON.SNAP_THRESHOLD;
    const size = CONSTANTS.FLOATING_BUTTON.SIZE;
    const margin = 16;

    const left = this.position.left || 0;
    const top = this.position.top || 0;
    const right = window.innerWidth - left - size;
    const bottom = window.innerHeight - top - size;

    // 判断最近的边
    const distances = {
      left: left,
      right: right,
      top: top,
      bottom: bottom
    };

    const nearest = Object.keys(distances).reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );

    // 吸附
    if (distances[nearest] < threshold) {
      this.position = {};

      switch (nearest) {
        case 'left':
          this.position.left = margin;
          this.position.top = top;
          break;
        case 'right':
          this.position.right = margin;
          this.position.top = top;
          break;
        case 'top':
          this.position.top = margin;
          this.position.left = left;
          break;
        case 'bottom':
          this.position.bottom = margin;
          this.position.left = left;
          break;
      }

      this.updatePosition();
    }
  }

  // 更新位置
  updatePosition() {
    const style = this.container.style;
    style.position = 'fixed';
    style.zIndex = CONSTANTS.FLOATING_BUTTON.Z_INDEX;

    // 清除所有位置
    style.top = '';
    style.right = '';
    style.bottom = '';
    style.left = '';

    // 设置新位置
    if (this.position.top !== undefined) {
      style.top = this.position.top + 'px';
    }
    if (this.position.right !== undefined) {
      style.right = this.position.right + 'px';
    }
    if (this.position.bottom !== undefined) {
      style.bottom = this.position.bottom + 'px';
    }
    if (this.position.left !== undefined) {
      style.left = this.position.left + 'px';
    }
  }

  // 获取位置信息（用于菜单定位）
  getPosition() {
    return this.container.getBoundingClientRect();
  }

  // 设置点击处理器
  onClick(handler) {
    this.clickHandler = handler;
  }

  // 显示/隐藏
  show() {
    this.container.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
  }
}
