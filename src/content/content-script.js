// Content Script 主入口

class CopyItApp {
  constructor() {
    this.selectionManager = new SelectionManager();
    this.historyManager = new HistoryManager();
    this.floatingButton = new FloatingButton();
    this.menu = new Menu(this.historyManager);
  }

  // 初始化应用
  init() {
    // 初始化各组件
    this.selectionManager.init();
    this.floatingButton.init();
    this.menu.init();

    // 设置选区监听
    this.selectionManager.addListener((state, text) => {
      this.handleSelectionChange(state, text);
    });

    // 设置浮窗点击事件
    this.floatingButton.onClick(() => {
      this.handleFloatingButtonClick();
    });

    // 设置菜单复制处理器
    this.menu.onCopy((text) => {
      return this.handleCopy(text);
    });

    console.log('Copy It initialized');
  }

  // 处理选区变化
  handleSelectionChange(state, text) {
    if (state === 'active' || state === 'checking') {
      this.floatingButton.setState('active');
    } else {
      this.floatingButton.setState('idle');
    }
  }

  // 处理浮窗按钮点击
  async handleFloatingButtonClick() {
    // 如果菜单已打开，关闭它
    if (this.menu.isOpen) {
      this.menu.close();
      return;
    }

    // 获取当前选区
    const selectedText = this.selectionManager.getCurrentSelection();
    let feedbackState = null;

    // 尝试复制选区
    if (selectedText && selectedText.length > 0) {
      const success = await this.handleCopy(selectedText, true);

      if (success) {
        feedbackState = {
          type: 'success',
          message: '✓ 已将选中内容复制到粘贴板'
        };
        this.floatingButton.setState('success');
      } else {
        // 失败原因
        if (selectedText.length > CONSTANTS.MAX_SINGLE_COPY_LENGTH) {
          feedbackState = {
            type: 'error',
            message: `✕ 复制失败：超出 ${CONSTANTS.MAX_SINGLE_COPY_LENGTH} 字符限制（本次 ${selectedText.length} 字符）`,
            failedText: selectedText
          };
        } else {
          feedbackState = {
            type: 'error',
            message: '✕ 复制失败',
            failedText: selectedText
          };
        }
      }
    } else {
      feedbackState = {
        type: 'info',
        message: '未检测到选中文本'
      };
    }

    // 打开菜单
    const buttonRect = this.floatingButton.getPosition();
    this.menu.open(buttonRect, feedbackState);
  }

  // 处理复制（核心复制逻辑）
  async handleCopy(text, addToHistory = false) {
    // 单条长度限制检查
    if (text.length > CONSTANTS.MAX_SINGLE_COPY_LENGTH && addToHistory) {
      return false;
    }

    try {
      // 尝试使用 Clipboard API
      await navigator.clipboard.writeText(text);

      // 复制成功，加入历史
      if (addToHistory) {
        this.historyManager.add(text);
      }

      return true;
    } catch (error) {
      console.error('Clipboard API failed, trying offscreen:', error);

      // 尝试通过 Service Worker 和 Offscreen 复制
      try {
        const response = await chrome.runtime.sendMessage({
          type: CONSTANTS.MESSAGE_TYPE.COPY_TO_CLIPBOARD,
          text: text
        });

        if (response && response.success) {
          // 复制成功，加入历史
          if (addToHistory) {
            this.historyManager.add(text);
          }
          return true;
        } else {
          console.error('Offscreen copy failed:', response?.error);
          return false;
        }
      } catch (runtimeError) {
        console.error('Runtime message failed:', runtimeError);
        return false;
      }
    }
  }
}

// 初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new CopyItApp();
    app.init();
  });
} else {
  const app = new CopyItApp();
  app.init();
}
