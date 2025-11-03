// 历史记录管理器
class HistoryManager {
  constructor() {
    this.history = [];
    this.listeners = [];
  }

  // 添加历史记录
  add(text) {
    // 不做去重，直接添加
    const item = {
      id: Date.now() + Math.random(),
      text: text,
      timestamp: Date.now(),
      charCount: text.length
    };

    this.history.unshift(item);

    // 保持最多 10 条
    if (this.history.length > CONSTANTS.MAX_HISTORY_COUNT) {
      this.history = this.history.slice(0, CONSTANTS.MAX_HISTORY_COUNT);
    }

    this.notifyListeners();
    return item;
  }

  // 获取所有历史
  getAll() {
    return this.history;
  }

  // 清空历史
  clear() {
    this.history = [];
    this.notifyListeners();
  }

  // 获取历史数量
  getCount() {
    return this.history.length;
  }

  // 添加监听器
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 通知监听器
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.history));
  }
}
