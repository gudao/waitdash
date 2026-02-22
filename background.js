chrome.runtime.onInstalled.addListener(() => {
  console.log('WaitDash 插件已安装');
  
  chrome.storage.local.get('waitdash_stats', (result) => {
    if (!result.waitdash_stats) {
      chrome.storage.local.set({ waitdash_stats: {} }, () => {
        console.log('初始化数据存储');
      });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveData') {
    chrome.storage.local.get('waitdash_stats', (result) => {
      try {
        const statsData = result.waitdash_stats || {};
        const { site, data } = message;
        const dateKey = data.date;
        
        if (!statsData[site]) {
          statsData[site] = {};
        }
        
        if (!statsData[site][dateKey]) {
          statsData[site][dateKey] = {
            totalActiveTime: 0,
            totalWaitTime: 0,
            date: dateKey
          };
        }
        
        const maxActive = Math.max(
          statsData[site][dateKey].totalActiveTime || 0,
          data.totalActiveTime || 0
        );
        const maxWait = Math.max(
          statsData[site][dateKey].totalWaitTime || 0,
          data.totalWaitTime || 0
        );
        
        statsData[site][dateKey] = {
          totalActiveTime: maxActive,
          totalWaitTime: maxWait,
          lastSaved: data.timestamp,
          date: dateKey
        };
        
        chrome.storage.local.set({ waitdash_stats: statsData }, () => {
          if (chrome.runtime.lastError) {
            console.error('保存数据失败:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError });
          } else {
            console.log('数据已保存（按日期合并）');
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
    chrome.storage.local.get('waitdash_stats', (result) => {
      sendResponse({ data: result.waitdash_stats || {} });
    });
    return true;
  } else if (message.action === 'clearData') {
    chrome.storage.local.set({ waitdash_stats: {}, aiUsageData: {} }, () => {
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
