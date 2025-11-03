// Service Worker - 消息中转和 Offscreen 管理

let offscreenDocumentCreated = false;

// 创建 Offscreen Document
async function createOffscreenDocument() {
  if (offscreenDocumentCreated) {
    return;
  }

  try {
    await chrome.offscreen.createDocument({
      url: 'src/offscreen/offscreen.html',
      reasons: ['CLIPBOARD'],
      justification: 'Write text to clipboard when content script fails'
    });
    offscreenDocumentCreated = true;
  } catch (error) {
    console.error('Failed to create offscreen document:', error);
  }
}

// 关闭 Offscreen Document
async function closeOffscreenDocument() {
  if (!offscreenDocumentCreated) {
    return;
  }

  try {
    await chrome.offscreen.closeDocument();
    offscreenDocumentCreated = false;
  } catch (error) {
    console.error('Failed to close offscreen document:', error);
  }
}

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'COPY_TO_CLIPBOARD') {
    handleCopyToClipboard(message.text).then(sendResponse);
    return true; // 保持消息通道开放
  }

  if (message.type === 'CLOSE_OFFSCREEN') {
    closeOffscreenDocument().then(sendResponse);
    return true;
  }
});

// 处理复制到剪贴板
async function handleCopyToClipboard(text) {
  try {
    // 尝试创建 Offscreen Document
    await createOffscreenDocument();

    // 发送消息到 Offscreen Document
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'OFFSCREEN_COPY',
          text: text
        },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response);
          }
        }
      );
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 扩展安装或更新时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('Copy It extension installed');
});
