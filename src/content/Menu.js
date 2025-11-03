// 菜单组件
class Menu {
  constructor(historyManager) {
    this.historyManager = historyManager;
    this.container = null;
    this.shadowRoot = null;
    this.isOpen = false;
    this.selectedItems = new Map(); // id -> order
    this.selectionOrder = 0;
    this.expandedItems = new Set();
    this.copyHandler = null;
    this.feedbackState = null; // { type: 'success' | 'error' | 'info', message: string, failedText?: string }
    this.menuState = 'main'; // 'main' | 'upgrade-intro' | 'upgrade-confirm' | 'upgrade-payment' | 'upgrade-result'
    this.buttonRect = null; // 保存浮窗位置用于重新定位
  }

  // 初始化
  init() {
    if (this._initialized) {
      console.error('[Copy It] Menu.init() called multiple times!');
      return;
    }
    this._initialized = true;

    this.createMenu();
    this.attachEventListeners();
  }

  // 创建菜单
  createMenu() {
    this.container = document.createElement('div');
    this.container.id = 'copy-it-menu';
    this.container.style.display = 'none';

    this.shadowRoot = this.container.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = this.getStyles();

    this.shadowRoot.appendChild(style);
    document.body.appendChild(this.container);
  }

  // 获取样式
  getStyles() {
    return `
      .menu-container {
        position: fixed;
        width: ${CONSTANTS.MENU.WIDTH}px;
        background: rgba(30, 30, 30, 0.95);
        backdrop-filter: blur(12px);
        border-radius: ${CONSTANTS.MENU.BORDER_RADIUS}px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 2147483646;
        animation: menuEnter ${CONSTANTS.ANIMATION.MENU_ENTER}ms cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      @keyframes menuEnter {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .menu-title {
        font-weight: 600;
        font-size: 15px;
      }

      .close-btn, .upgrade-btn, .clear-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 13px;
        transition: all 0.2s;
      }

      .close-btn:hover, .clear-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .upgrade-btn {
        color: #3b82f6;
        font-weight: 500;
      }

      .upgrade-btn:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #60a5fa;
      }

      .feedback-bar {
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        min-height: 36px;
      }

      .feedback-bar.success {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
      }

      .feedback-bar.error {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }

      .feedback-bar.info {
        background: rgba(107, 114, 128, 0.15);
        color: #9ca3af;
      }

      .feedback-icon {
        font-weight: bold;
        font-size: 16px;
      }

      .manual-copy-box {
        margin: 8px 16px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }

      .manual-copy-textarea {
        flex: 1;
        background: transparent;
        border: none;
        color: white;
        font-family: monospace;
        font-size: 12px;
        resize: vertical;
        min-height: 40px;
        max-height: 120px;
        outline: none;
      }

      .manual-copy-btn {
        background: rgba(59, 130, 246, 0.8);
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
        transition: all 0.2s;
      }

      .manual-copy-btn:hover {
        background: rgba(59, 130, 246, 1);
      }

      .history-list {
        max-height: 400px;
        overflow-y: auto;
        padding: 8px 0;
      }

      .history-list::-webkit-scrollbar {
        width: 6px;
      }

      .history-list::-webkit-scrollbar-track {
        background: transparent;
      }

      .history-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }

      .history-list::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .history-item {
        padding: 10px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: background 0.2s;
      }

      .history-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .history-item-main {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }

      .history-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        flex-shrink: 0;
      }

      .history-preview {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .history-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }

      .history-count {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        flex-shrink: 0;
      }

      .history-badge {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3b82f6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        flex-shrink: 0;
        animation: badgeEnter 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes badgeEnter {
        from {
          transform: scale(0.8);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .history-expanded {
        margin-top: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        max-height: ${CONSTANTS.MENU.MAX_EXPANDED_HEIGHT}px;
        overflow-y: auto;
        position: relative;
      }

      .history-expanded-text {
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 13px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.9);
      }

      .history-expanded-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
      }

      .history-expanded-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }

      .history-expanded-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .empty-state {
        padding: 40px 16px;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
      }

      .bottom-actions {
        padding: 12px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .separator-info {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
      }

      .copy-all-btn {
        background: #3b82f6;
        border: none;
        color: white;
        padding: 8px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .copy-all-btn:hover:not(:disabled) {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }

      .copy-all-btn:disabled {
        background: rgba(107, 114, 128, 0.3);
        cursor: not-allowed;
        opacity: 0.5;
      }

      .copy-all-btn.success {
        background: #22c55e;
      }

      .menu-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border: ${CONSTANTS.MENU.ARROW_SIZE}px solid transparent;
      }

      .menu-arrow.top {
        top: -${CONSTANTS.MENU.ARROW_SIZE * 2}px;
        border-bottom-color: rgba(30, 30, 30, 0.95);
        border-top: none;
      }

      .menu-arrow.bottom {
        bottom: -${CONSTANTS.MENU.ARROW_SIZE * 2}px;
        border-top-color: rgba(30, 30, 30, 0.95);
        border-bottom: none;
      }

      .menu-arrow.left {
        left: -${CONSTANTS.MENU.ARROW_SIZE * 2}px;
        border-right-color: rgba(30, 30, 30, 0.95);
        border-left: none;
      }

      .menu-arrow.right {
        right: -${CONSTANTS.MENU.ARROW_SIZE * 2}px;
        border-left-color: rgba(30, 30, 30, 0.95);
        border-right: none;
      }

      /* 升级页面样式 */
      .upgrade-page {
        padding: 24px 20px;
        min-height: 300px;
        display: flex;
        flex-direction: column;
      }

      .upgrade-page-header {
        text-align: center;
        margin-bottom: 24px;
      }

      .upgrade-page-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #3b82f6;
      }

      .upgrade-page-subtitle {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.5;
      }

      .upgrade-page-content {
        flex: 1;
        margin-bottom: 24px;
      }

      .upgrade-feature-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .upgrade-feature-item {
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .upgrade-feature-item:last-child {
        border-bottom: none;
      }

      .upgrade-feature-icon {
        color: #3b82f6;
        font-size: 18px;
        flex-shrink: 0;
      }

      .upgrade-feature-text {
        flex: 1;
      }

      .upgrade-feature-title {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .upgrade-feature-desc {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.4;
      }

      .upgrade-page-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }

      .upgrade-btn-primary, .upgrade-btn-secondary {
        padding: 10px 24px;
        border-radius: 6px;
        border: none;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .upgrade-btn-primary {
        background: #3b82f6;
        color: white;
      }

      .upgrade-btn-primary:hover {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }

      .upgrade-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .upgrade-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .upgrade-price-box {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 20px 0;
      }

      .upgrade-price {
        font-size: 36px;
        font-weight: 700;
        color: #3b82f6;
      }

      .upgrade-price-desc {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 8px;
      }

      .upgrade-result-icon {
        text-align: center;
        font-size: 64px;
        margin: 20px 0;
      }

      .upgrade-result-message {
        text-align: center;
        font-size: 16px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
        margin: 20px 0;
      }
    `;
  }

  // 渲染菜单
  render() {
    let content;

    switch (this.menuState) {
      case 'upgrade-intro':
        content = this.renderUpgradeIntro();
        break;
      case 'upgrade-confirm':
        content = this.renderUpgradeConfirm();
        break;
      case 'upgrade-payment':
        content = this.renderUpgradePayment();
        break;
      case 'upgrade-result':
        content = this.renderUpgradeResult();
        break;
      default:
        content = this.renderMainMenu();
    }

    const menuHTML = `
      <div class="menu-container">
        <div class="menu-arrow"></div>
        ${content}
      </div>
    `;

    this.shadowRoot.innerHTML = `<style>${this.getStyles()}</style>${menuHTML}`;
    this.attachMenuEventListeners();

    // 重新定位菜单（innerHTML 替换会清除所有 inline style）
    if (this.isOpen && this.buttonRect) {
      this.positionMenu(this.buttonRect);
    }
  }

  // 渲染主菜单
  renderMainMenu() {
    // 复制失败时不显示升级按钮
    const showUpgradeBtn = !this.feedbackState || this.feedbackState.type !== 'error';

    return `
      <div class="menu-header">
        <span class="menu-title">Copy It</span>
        <div style="display: flex; gap: 8px;">
          ${showUpgradeBtn ? '<button class="upgrade-btn" data-action="upgrade">升级 Pro</button>' : ''}
          <button class="clear-btn" data-action="clear">清空</button>
          <button class="close-btn" data-action="close">✕</button>
        </div>
      </div>
      ${this.renderFeedback()}
      ${this.renderManualCopyBox()}
      ${this.renderHistory()}
      ${this.renderBottomActions()}
    `;
  }

  // 渲染反馈条
  renderFeedback() {
    if (!this.feedbackState) {
      return '<div class="feedback-bar info"><span class="feedback-icon">ℹ</span><span>未检测到选中文本</span></div>';
    }

    const { type, message } = this.feedbackState;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };

    return `
      <div class="feedback-bar ${type}">
        <span class="feedback-icon">${icons[type]}</span>
        <span>${message}</span>
      </div>
    `;
  }

  // 渲染手动复制框
  renderManualCopyBox() {
    if (!this.feedbackState || this.feedbackState.type !== 'error' || !this.feedbackState.failedText) {
      return '';
    }

    return `
      <div class="manual-copy-box">
        <textarea class="manual-copy-textarea" readonly>${this.escapeHtml(this.feedbackState.failedText)}</textarea>
        <button class="manual-copy-btn" data-action="manual-copy">复制</button>
      </div>
    `;
  }

  // 渲染历史列表
  renderHistory() {
    const history = this.historyManager.getAll();

    if (history.length === 0) {
      return '<div class="empty-state">暂无复制历史</div>';
    }

    const items = history.map(item => this.renderHistoryItem(item)).join('');
    return `<div class="history-list">${items}</div>`;
  }

  // 渲染单个历史项
  renderHistoryItem(item) {
    const isSelected = this.selectedItems.has(item.id);
    const order = this.selectedItems.get(item.id);
    const isExpanded = this.expandedItems.has(item.id);
    const badge = isSelected ? this.renderBadge(order) : '';

    return `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-main">
          <input type="checkbox" class="history-checkbox" ${isSelected ? 'checked' : ''} data-action="toggle-select">
          <div class="history-preview" data-action="toggle-expand">
            <span class="history-text">${this.escapeHtml(this.truncateText(item.text))}</span>
            <span class="history-count">(${item.charCount} 字)</span>
          </div>
          ${badge}
        </div>
        ${isExpanded ? this.renderExpandedContent(item) : ''}
      </div>
    `;
  }

  // 渲染序号徽标
  renderBadge(order) {
    const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
    const display = order < circledNumbers.length ? circledNumbers[order] : `${order + 1}`;
    return `<div class="history-badge">${display}</div>`;
  }

  // 渲染展开内容
  renderExpandedContent(item) {
    return `
      <div class="history-expanded">
        <div class="history-expanded-text">${this.escapeHtml(item.text)}</div>
        <div class="history-expanded-actions">
          <button class="history-expanded-btn" data-action="collapse">收起</button>
          <button class="history-expanded-btn" data-action="copy-single">复制本条</button>
        </div>
      </div>
    `;
  }

  // 渲染底部操作区
  renderBottomActions() {
    const hasSelection = this.selectedItems.size > 0;

    return `
      <div class="bottom-actions">
        <span class="separator-info">合并分隔符：换行</span>
        <button class="copy-all-btn" ${!hasSelection ? 'disabled' : ''} data-action="copy-all">
          全部复制
        </button>
      </div>
    `;
  }

  // 附加菜单事件监听
  attachMenuEventListeners() {
    // 移除旧的监听器，避免累积
    if (this.shadowClickHandler) {
      this.shadowRoot.removeEventListener('click', this.shadowClickHandler);
    }

    // 保存监听器引用，以便下次移除
    this.shadowClickHandler = (e) => {
      const target = e.target;
      const action = target.getAttribute('data-action');
      const item = target.closest('.history-item');
      const itemId = item ? parseFloat(item.getAttribute('data-id')) : null;

      switch (action) {
        case 'close':
          this.close();
          break;
        case 'upgrade':
          this.handleUpgrade();
          break;
        case 'clear':
          this.handleClear();
          break;
        case 'manual-copy':
          this.handleManualCopy();
          break;
        case 'toggle-select':
          this.handleToggleSelect(itemId);
          break;
        case 'toggle-expand':
          this.handleToggleExpand(itemId);
          break;
        case 'collapse':
          this.handleCollapse(itemId);
          break;
        case 'copy-single':
          this.handleCopySingle(itemId);
          break;
        case 'copy-all':
          this.handleCopyAll();
          break;
        case 'back-to-main':
          this.handleBackToMain();
          break;
        case 'upgrade-next':
          this.handleUpgradeNext();
          break;
        case 'upgrade-back':
          this.handleUpgradeBack();
          break;
        case 'upgrade-pay':
          this.handleUpgradePay();
          break;
      }
    };

    // 添加新的监听器
    this.shadowRoot.addEventListener('click', this.shadowClickHandler);
  }

  // 附加外部事件监听
  attachEventListeners() {
    // 移除旧的监听器，避免累积
    if (this.containerClickHandler) {
      this.container.removeEventListener('click', this.containerClickHandler);
    }
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }
    if (this.documentKeydownHandler) {
      document.removeEventListener('keydown', this.documentKeydownHandler);
    }

    // 在 container 上阻止点击事件冒泡到 document
    this.containerClickHandler = (e) => {
      e.stopPropagation();
    };
    this.container.addEventListener('click', this.containerClickHandler);

    // 点击外部关闭
    this.documentClickHandler = (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        const floatingButton = document.getElementById('copy-it-floating-button');
        if (floatingButton && !floatingButton.contains(e.target)) {
          this.close();
        }
      }
    };
    document.addEventListener('click', this.documentClickHandler);

    // ESC 关闭
    this.documentKeydownHandler = (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.documentKeydownHandler);
  }

  // 处理选择切换
  handleToggleSelect(itemId) {
    const wasSelected = this.selectedItems.has(itemId);

    if (wasSelected) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.set(itemId, this.selectionOrder++);
    }

    // 只更新变化的部分，避免整个菜单闪烁
    this.updateCheckboxState(itemId, !wasSelected);
  }

  // 优化的复选框状态更新（不重新渲染整个菜单）
  updateCheckboxState(itemId, isSelected) {
    // 找到对应的历史记录项
    const historyItem = this.shadowRoot.querySelector(`.history-item[data-id="${itemId}"]`);
    if (!historyItem) return;

    // 更新复选框
    const checkbox = historyItem.querySelector('.history-checkbox');
    if (checkbox) {
      checkbox.checked = isSelected;
    }

    // 更新徽标
    const existingBadge = historyItem.querySelector('.history-badge');

    if (isSelected) {
      // 添加徽标（如果不存在）
      if (!existingBadge) {
        const order = this.selectedItems.get(itemId);
        const badgeHTML = this.renderBadge(order);
        const mainDiv = historyItem.querySelector('.history-item-main');
        if (mainDiv) {
          mainDiv.insertAdjacentHTML('beforeend', badgeHTML);
        }
      }
    } else {
      // 移除徽标
      if (existingBadge) {
        existingBadge.remove();
      }
    }

    // 更新底部按钮状态
    this.updateBottomActionsState();
  }

  // 更新底部操作按钮状态
  updateBottomActionsState() {
    const copyAllBtn = this.shadowRoot.querySelector('.copy-all-btn');
    if (copyAllBtn) {
      const hasSelection = this.selectedItems.size > 0;
      if (hasSelection) {
        copyAllBtn.removeAttribute('disabled');
      } else {
        copyAllBtn.setAttribute('disabled', '');
      }
    }
  }

  // 处理展开切换
  handleToggleExpand(itemId) {
    const wasExpanded = this.expandedItems.has(itemId);

    if (wasExpanded) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }

    // ✅ 优化：只更新展开状态，不重新渲染整个菜单
    this.updateExpandedState(itemId, !wasExpanded);
  }

  // 处理收起
  handleCollapse(itemId) {
    this.expandedItems.delete(itemId);
    // ✅ 优化：只更新展开状态
    this.updateExpandedState(itemId, false);
  }

  // 优化的展开状态更新
  updateExpandedState(itemId, isExpanded) {
    const historyItem = this.shadowRoot.querySelector(`.history-item[data-id="${itemId}"]`);
    if (!historyItem) return;

    // 查找已有的展开内容
    const existingExpanded = historyItem.querySelector('.history-expanded');

    if (isExpanded) {
      // 添加展开内容（如果不存在）
      if (!existingExpanded) {
        const history = this.historyManager.getAll();
        const item = history.find(h => h.id === itemId);
        if (item) {
          const expandedHTML = this.renderExpandedContent(item);
          historyItem.insertAdjacentHTML('beforeend', expandedHTML);
        }
      }
    } else {
      // 移除展开内容
      if (existingExpanded) {
        existingExpanded.remove();
      }
    }
  }

  // 处理复制单条
  async handleCopySingle(itemId) {
    const history = this.historyManager.getAll();
    const item = history.find(h => h.id === itemId);

    if (item && this.copyHandler) {
      await this.copyHandler(item.text);
    }
  }

  // 处理全部复制
  async handleCopyAll() {
    if (this.selectedItems.size === 0) return;

    const history = this.historyManager.getAll();
    const selectedItems = Array.from(this.selectedItems.entries())
      .sort((a, b) => a[1] - b[1]) // 按勾选顺序排序
      .map(([id]) => history.find(h => h.id === id))
      .filter(Boolean);

    const mergedText = selectedItems.map(item => item.text).join(CONSTANTS.SEPARATOR) + CONSTANTS.SEPARATOR;

    if (this.copyHandler) {
      const success = await this.copyHandler(mergedText);

      if (success) {
        // 显示成功状态
        const btn = this.shadowRoot.querySelector('.copy-all-btn');
        if (btn) {
          btn.textContent = '✓ 已合并复制';
          btn.classList.add('success');

          setTimeout(() => {
            btn.textContent = '全部复制';
            btn.classList.remove('success');
          }, CONSTANTS.ANIMATION.SUCCESS_TEXT_REVERT);
        }
      }
    }
  }

  // 处理手动复制
  async handleManualCopy() {
    const textarea = this.shadowRoot.querySelector('.manual-copy-textarea');
    if (textarea) {
      textarea.select();
      try {
        await navigator.clipboard.writeText(textarea.value);
        this.setFeedback('success', '已复制到剪贴板');
      } catch (error) {
        // 静默失败，用户已经选中了文本可以手动复制
      }
    }
  }

  // 渲染升级介绍页
  renderUpgradeIntro() {
    return `
      <div class="menu-header">
        <span class="menu-title">升级 Pro</span>
        <button class="close-btn" data-action="close">✕</button>
      </div>
      <div class="upgrade-page">
        <div class="upgrade-page-header">
          <div class="upgrade-page-title">🎉 解锁全部功能</div>
          <div class="upgrade-page-subtitle">升级到 Pro 版本，享受更多强大功能</div>
        </div>
        <div class="upgrade-page-content">
          <ul class="upgrade-feature-list">
            <li class="upgrade-feature-item">
              <span class="upgrade-feature-icon">✓</span>
              <div class="upgrade-feature-text">
                <div class="upgrade-feature-title">无限复制长度</div>
                <div class="upgrade-feature-desc">突破 1000 字符限制，支持任意长度文本复制</div>
              </div>
            </li>
            <li class="upgrade-feature-item">
              <span class="upgrade-feature-icon">✓</span>
              <div class="upgrade-feature-text">
                <div class="upgrade-feature-title">无限历史记录</div>
                <div class="upgrade-feature-desc">保存更多历史记录，不再限制 10 条</div>
              </div>
            </li>
            <li class="upgrade-feature-item">
              <span class="upgrade-feature-icon">✓</span>
              <div class="upgrade-feature-text">
                <div class="upgrade-feature-title">跨标签页同步</div>
                <div class="upgrade-feature-desc">历史记录在所有标签页间自动同步</div>
              </div>
            </li>
            <li class="upgrade-feature-item">
              <span class="upgrade-feature-icon">✓</span>
              <div class="upgrade-feature-text">
                <div class="upgrade-feature-title">自定义分隔符</div>
                <div class="upgrade-feature-desc">合并复制时可选择空格、逗号等分隔符</div>
              </div>
            </li>
            <li class="upgrade-feature-item">
              <span class="upgrade-feature-icon">✓</span>
              <div class="upgrade-feature-text">
                <div class="upgrade-feature-title">优先技术支持</div>
                <div class="upgrade-feature-desc">获得更快的问题响应和功能更新</div>
              </div>
            </li>
          </ul>
        </div>
        <div class="upgrade-page-actions">
          <button class="upgrade-btn-secondary" data-action="back-to-main">取消</button>
          <button class="upgrade-btn-primary" data-action="upgrade-next">继续</button>
        </div>
      </div>
    `;
  }

  // 渲染升级确认页
  renderUpgradeConfirm() {
    return `
      <div class="menu-header">
        <span class="menu-title">确认升级</span>
        <button class="close-btn" data-action="close">✕</button>
      </div>
      <div class="upgrade-page">
        <div class="upgrade-page-header">
          <div class="upgrade-page-title">Copy It Pro</div>
          <div class="upgrade-page-subtitle">一次付费，终身使用</div>
        </div>
        <div class="upgrade-page-content">
          <div class="upgrade-price-box">
            <div class="upgrade-price">¥ 29.9</div>
            <div class="upgrade-price-desc">终身版 · 所有功能 · 永久更新</div>
          </div>
          <ul class="upgrade-feature-list">
            <li class="upgrade-feature-item">
              <span class="upgrade-feature-icon">✓</span>
              <div class="upgrade-feature-text">所有 Pro 功能立即生效</div>
            </li>
            <li class="upgrade-feature-item">
              <span class="upgrade-feature-icon">✓</span>
              <div class="upgrade-feature-text">未来所有功能更新免费</div>
            </li>
            <li class="upgrade-feature-item">
              <span class="upgrade-feature-icon">✓</span>
              <div class="upgrade-feature-text">无广告、无订阅、无隐藏费用</div>
            </li>
          </ul>
        </div>
        <div class="upgrade-page-actions">
          <button class="upgrade-btn-secondary" data-action="upgrade-back">返回</button>
          <button class="upgrade-btn-primary" data-action="upgrade-pay">去支付</button>
        </div>
      </div>
    `;
  }

  // 渲染升级支付页（直接跳过到结果页）
  renderUpgradePayment() {
    // 自动跳转到结果页
    setTimeout(() => {
      this.menuState = 'upgrade-result';
      this.render();
      if (this.buttonRect) {
        this.positionMenu(this.buttonRect);
      }
    }, 500);

    return `
      <div class="menu-header">
        <span class="menu-title">处理中</span>
        <button class="close-btn" data-action="close">✕</button>
      </div>
      <div class="upgrade-page">
        <div class="upgrade-page-content" style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 32px; margin-bottom: 16px;">⏳</div>
          <div style="font-size: 16px; color: rgba(255, 255, 255, 0.9);">正在处理...</div>
        </div>
      </div>
    `;
  }

  // 渲染升级结果页
  renderUpgradeResult() {
    return `
      <div class="menu-header">
        <span class="menu-title">升级结果</span>
        <button class="close-btn" data-action="close">✕</button>
      </div>
      <div class="upgrade-page">
        <div class="upgrade-page-content">
          <div class="upgrade-result-icon">💡</div>
          <div class="upgrade-result-message">
            <strong>感谢支持，暂时不允许升级！</strong>
            <br><br>
            这只是一个功能演示。<br>
            实际的付费升级功能尚未开放。<br>
            请继续使用免费版本，谢谢！
          </div>
        </div>
        <div class="upgrade-page-actions">
          <button class="upgrade-btn-primary" data-action="back-to-main">返回</button>
        </div>
      </div>
    `;
  }

  // 处理升级
  handleUpgrade() {
    this.menuState = 'upgrade-intro';
    this.render();
    if (this.buttonRect) {
      this.positionMenu(this.buttonRect);
    }
  }

  // 处理返回主菜单
  handleBackToMain() {
    this.menuState = 'main';
    this.render();
    if (this.buttonRect) {
      this.positionMenu(this.buttonRect);
    }
  }

  // 处理升级流程的下一步
  handleUpgradeNext() {
    if (this.menuState === 'upgrade-intro') {
      this.menuState = 'upgrade-confirm';
    }
    this.render();
    if (this.buttonRect) {
      this.positionMenu(this.buttonRect);
    }
  }

  // 处理升级流程的返回
  handleUpgradeBack() {
    if (this.menuState === 'upgrade-confirm') {
      this.menuState = 'upgrade-intro';
    }
    this.render();
    if (this.buttonRect) {
      this.positionMenu(this.buttonRect);
    }
  }

  // 处理去支付
  handleUpgradePay() {
    this.menuState = 'upgrade-payment';
    this.render();
    if (this.buttonRect) {
      this.positionMenu(this.buttonRect);
    }
  }

  // 处理清空
  handleClear() {
    if (confirm('确定要清空所有历史记录吗？')) {
      this.historyManager.clear();
      this.selectedItems.clear();
      this.selectionOrder = 0;
      this.expandedItems.clear();
      this.render();
    }
  }

  // 打开菜单
  open(buttonRect, feedbackState) {
    this.isOpen = true;
    this.feedbackState = feedbackState;
    this.buttonRect = buttonRect;
    this.menuState = 'main';
    this.container.style.display = 'block';
    this.render();
  }

  // 定位菜单
  positionMenu(buttonRect) {
    const menuContainer = this.shadowRoot.querySelector('.menu-container');
    const arrow = this.shadowRoot.querySelector('.menu-arrow');

    if (!menuContainer || !arrow) return;

    const menuRect = menuContainer.getBoundingClientRect();
    const offset = CONSTANTS.MENU.OFFSET_FROM_BUTTON;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top, left;
    let arrowClass = '';

    // 默认在按钮下方
    if (buttonRect.bottom + offset + menuRect.height <= viewportHeight) {
      top = buttonRect.bottom + offset;
      left = buttonRect.left + buttonRect.width / 2 - CONSTANTS.MENU.WIDTH / 2;
      arrowClass = 'top';

      // 箭头水平居中对准按钮
      arrow.style.left = `${CONSTANTS.MENU.WIDTH / 2 - CONSTANTS.MENU.ARROW_SIZE}px`;
    }
    // 上方
    else if (buttonRect.top - offset - menuRect.height >= 0) {
      top = buttonRect.top - offset - menuRect.height;
      left = buttonRect.left + buttonRect.width / 2 - CONSTANTS.MENU.WIDTH / 2;
      arrowClass = 'bottom';
      arrow.style.left = `${CONSTANTS.MENU.WIDTH / 2 - CONSTANTS.MENU.ARROW_SIZE}px`;
    }
    // 右侧
    else if (buttonRect.right + offset + CONSTANTS.MENU.WIDTH <= viewportWidth) {
      top = buttonRect.top + buttonRect.height / 2 - menuRect.height / 2;
      left = buttonRect.right + offset;
      arrowClass = 'left';
      arrow.style.top = `${menuRect.height / 2 - CONSTANTS.MENU.ARROW_SIZE}px`;
    }
    // 左侧
    else {
      top = buttonRect.top + buttonRect.height / 2 - menuRect.height / 2;
      left = buttonRect.left - offset - CONSTANTS.MENU.WIDTH;
      arrowClass = 'right';
      arrow.style.top = `${menuRect.height / 2 - CONSTANTS.MENU.ARROW_SIZE}px`;
    }

    // 限制在视口内
    left = Math.max(8, Math.min(left, viewportWidth - CONSTANTS.MENU.WIDTH - 8));
    top = Math.max(8, Math.min(top, viewportHeight - menuRect.height - 8));

    menuContainer.style.top = `${top}px`;
    menuContainer.style.left = `${left}px`;

    arrow.className = `menu-arrow ${arrowClass}`;
  }

  // 关闭菜单
  close() {
    this.isOpen = false;
    this.menuState = 'main';
    this.container.style.display = 'none';
  }

  // 设置反馈状态
  setFeedback(type, message, failedText = null) {
    this.feedbackState = { type, message, failedText };
    if (this.isOpen) {
      this.render();
    }
  }

  // 设置复制处理器
  onCopy(handler) {
    this.copyHandler = handler;
  }

  // 工具函数
  truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
