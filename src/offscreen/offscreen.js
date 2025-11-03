// Offscreen Document - 处理剪贴板写入

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OFFSCREEN_COPY') {
    handleOffscreenCopy(message.text).then(sendResponse);
    return true; // 保持消息通道开放
  }
});

async function handleOffscreenCopy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error('Offscreen clipboard write failed:', error);
    return { success: false, error: error.message };
  }
}
