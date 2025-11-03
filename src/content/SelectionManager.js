// 选区管理器
class SelectionManager {
  constructor() {
    this.currentSelection = '';
    this.hasValidSelection = false;
    this.listeners = [];
  }

  // 初始化监听
  init() {
    document.addEventListener('mouseup', () => this.handleSelectionChange());
    document.addEventListener('selectionchange', () => this.checkSelection());
  }

  // 处理选区变化（mouseup 时缓存）
  handleSelectionChange() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      this.clearSelection();
      return;
    }

    // 处理多 Range 选区
    let selectedText = '';
    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      const text = range.toString().trim();
      if (text) {
        if (selectedText) {
          selectedText += CONSTANTS.SEPARATOR;
        }
        selectedText += text;
      }
    }

    // 检查是否满足最小长度要求
    if (selectedText.length >= CONSTANTS.MIN_SELECTION_LENGTH) {
      this.currentSelection = selectedText;
      this.hasValidSelection = true;
      this.notifyListeners('active', selectedText);
    } else {
      this.clearSelection();
    }
  }

  // 实时检查选区状态（用于浮窗状态更新）
  checkSelection() {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';

    if (text.length >= CONSTANTS.MIN_SELECTION_LENGTH) {
      this.hasValidSelection = true;
      this.notifyListeners('checking', text);
    } else if (this.hasValidSelection && text.length === 0) {
      // 选区被清空，但保留缓存的选区
      this.notifyListeners('idle', this.currentSelection);
    }
  }

  // 清空选区
  clearSelection() {
    this.currentSelection = '';
    this.hasValidSelection = false;
    this.notifyListeners('idle', '');
  }

  // 获取当前选区
  getCurrentSelection() {
    return this.currentSelection;
  }

  // 是否有有效选区
  hasSelection() {
    return this.hasValidSelection && this.currentSelection.length > 0;
  }

  // 添加监听器
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 通知监听器
  notifyListeners(state, text) {
    this.listeners.forEach(callback => callback(state, text));
  }
}
