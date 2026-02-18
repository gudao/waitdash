chrome.runtime.onInstalled.addListener(() => {
  console.log('WaitDash 插件已安装');
  
  chrome.storage.local.get('aiUsageData', (result) => {
    if (!result.aiUsageData) {
      chrome.storage.local.set({ aiUsageData: {} }, () => {
        console.log('初始化数据存储');
      });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveData') {
    chrome.storage.local.get('aiUsageData', (result) => {
      try {
        const usageData = result.aiUsageData || {};
        const { site, data } = message;
        
        if (!usageData[site]) {
          usageData[site] = [];
        }
        
        usageData[site].push(data);
        
        if (usageData[site].length > 100) {
          usageData[site] = usageData[site].slice(-100);
        }
        
        chrome.storage.local.set({ aiUsageData: usageData }, () => {
          if (chrome.runtime.lastError) {
            console.error('保存数据失败:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError });
          } else {
            console.log('数据已保存');
            sendResponse({ success: true });
          }
        });
      } catch (error) {
        console.error('保存数据失败:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
    return true;
  } else if (message.action === 'getData') {
    chrome.storage.local.get('aiUsageData', (result) => {
      sendResponse({ data: result.aiUsageData || {} });
    });
    return true;
  } else if (message.action === 'clearData') {
    chrome.storage.local.set({ aiUsageData: {} }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('标签页已关闭，停止追踪');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    console.log('标签页已更新', tab.url);
  }
});