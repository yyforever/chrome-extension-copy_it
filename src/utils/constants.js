// 常量定义
const CONSTANTS = {
  // 选区限制
  MIN_SELECTION_LENGTH: 2,
  MAX_SINGLE_COPY_LENGTH: 1000,

  // 历史记录
  MAX_HISTORY_COUNT: 10,

  // 浮窗配置
  FLOATING_BUTTON: {
    SIZE: 48,
    BORDER_RADIUS: 12,
    DEFAULT_POSITION: { top: 16, right: 16 },
    SNAP_THRESHOLD: 30,
    Z_INDEX: 2147483647
  },

  // 菜单配置
  MENU: {
    WIDTH: 384,
    BORDER_RADIUS: 12,
    MAX_EXPANDED_HEIGHT: 320,
    ARROW_SIZE: 8,
    OFFSET_FROM_BUTTON: 12
  },

  // 动画时长
  ANIMATION: {
    MENU_ENTER: 200,
    SUCCESS_FLASH: 400,
    SUCCESS_TEXT_REVERT: 800
  },

  // 消息类型
  MESSAGE_TYPE: {
    COPY_TO_CLIPBOARD: 'COPY_TO_CLIPBOARD',
    OPEN_OFFSCREEN: 'OPEN_OFFSCREEN',
    COPY_SUCCESS: 'COPY_SUCCESS',
    COPY_FAILED: 'COPY_FAILED'
  },

  // 分隔符
  SEPARATOR: '\n'
};

// 如果在浏览器环境中，暴露到全局
if (typeof window !== 'undefined') {
  window.CONSTANTS = CONSTANTS;
}
