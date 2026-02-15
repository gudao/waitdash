document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

function loadSettings() {
  chrome.storage.local.get('waitdashSettings', (result) => {
    const settings = result.waitdashSettings || {
      sites: {
        doubao: true,
        yuanbao: true,
        chatgpt: true,
        claude: true,
        gemini: true
      },
      general: {
        trackingEnabled: true,
        detailedLogs: false
      }
    };
    
    document.getElementById('toggle-doubao').checked = settings.sites.doubao;
    document.getElementById('toggle-yuanbao').checked = settings.sites.yuanbao;
    document.getElementById('toggle-chatgpt').checked = settings.sites.chatgpt;
    document.getElementById('toggle-claude').checked = settings.sites.claude;
    document.getElementById('toggle-gemini').checked = settings.sites.gemini;
    document.getElementById('toggle-tracking').checked = settings.general.trackingEnabled;
    document.getElementById('toggle-logs').checked = settings.general.detailedLogs;
  });
}

function saveSettings() {
  const settings = {
    sites: {
      doubao: document.getElementById('toggle-doubao').checked,
      yuanbao: document.getElementById('toggle-yuanbao').checked,
      chatgpt: document.getElementById('toggle-chatgpt').checked,
      claude: document.getElementById('toggle-claude').checked,
      gemini: document.getElementById('toggle-gemini').checked
    },
    general: {
      trackingEnabled: document.getElementById('toggle-tracking').checked,
      detailedLogs: document.getElementById('toggle-logs').checked
    }
  };
  
  chrome.storage.local.set({ waitdashSettings: settings }, () => {
    showStatusMessage('设置已保存', 'success');
  });
}

function setupEventListeners() {
  document.getElementById('save-btn').addEventListener('click', saveSettings);
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('clear-all-btn').addEventListener('click', clearAllData);
}

function exportData() {
  chrome.storage.local.get(['aiUsageData', 'waitdashSettings'], (result) => {
    const exportData = {
      aiUsageData: result.aiUsageData || {},
      settings: result.waitdashSettings || {},
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waitdash-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showStatusMessage('数据已导出', 'success');
  });
}

function clearAllData() {
  if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
    chrome.storage.local.set({ aiUsageData: {} }, () => {
      showStatusMessage('所有数据已清空', 'success');
    });
  }
}

function showStatusMessage(message, type) {
  const statusElement = document.getElementById('status-message');
  statusElement.textContent = message;
  statusElement.className = `status-message status-${type}`;
  statusElement.style.display = 'block';
  
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}