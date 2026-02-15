document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

function loadData() {
  chrome.storage.local.get('aiUsageData', (result) => {
    const usageData = result.aiUsageData || {};
    const dataContainer = document.getElementById('data-container');
    
    if (Object.keys(usageData).length === 0) {
      dataContainer.innerHTML = '<div class="empty-state">暂无数据，请先使用AI服务</div>';
      return;
    }
    
    dataContainer.innerHTML = '';
    
    const totalStats = calculateTotalStats(usageData);
    if (totalStats) {
      const totalCard = createTotalStatsCard(totalStats);
      dataContainer.appendChild(totalCard);
    }
    
    Object.keys(usageData).forEach(site => {
      const siteData = usageData[site];
      if (siteData.length > 0) {
        const latestData = siteData[siteData.length - 1];
        const siteCard = createSiteCard(site, latestData);
        dataContainer.appendChild(siteCard);
      }
    });
  });
}

function calculateTotalStats(usageData) {
  let totalTime = 0;
  let totalWaitTime = 0;
  let siteCount = 0;
  
  Object.keys(usageData).forEach(site => {
    const siteData = usageData[site];
    if (siteData.length > 0) {
      const latestData = siteData[siteData.length - 1];
      totalTime += latestData.totalTime;
      totalWaitTime += latestData.totalWaitTime;
      siteCount++;
    }
  });
  
  if (siteCount === 0) return null;
  
  return {
    totalTime,
    totalWaitTime,
    waitPercentage: totalTime > 0 ? (totalWaitTime / totalTime) * 100 : 0,
    siteCount
  };
}

function createTotalStatsCard(stats) {
  const card = document.createElement('div');
  card.className = 'site-card';
  card.style.borderLeftColor = '#2196F3';
  
  const totalTimeMinutes = (stats.totalTime / 1000 / 60).toFixed(2);
  const waitTimeMinutes = (stats.totalWaitTime / 1000 / 60).toFixed(2);
  const waitPercentage = stats.waitPercentage.toFixed(1);
  
  card.innerHTML = `
    <div class="site-title">总计 (${stats.siteCount} 个网站)</div>
    <div class="time-info">总使用时间: <span class="total-time">${totalTimeMinutes} 分钟</span></div>
    <div class="time-info">等待时间: <span class="wait-time">${waitTimeMinutes} 分钟</span></div>
    <div class="time-info">等待占比: ${waitPercentage}%</div>
    <div class="time-info">平均等待占比: ${(stats.waitPercentage / stats.siteCount).toFixed(1)}%</div>
  `;
  
  return card;
}

function createSiteCard(site, data) {
  const card = document.createElement('div');
  card.className = 'site-card';
  
  const totalTimeMinutes = (data.totalTime / 1000 / 60).toFixed(2);
  const waitTimeMinutes = (data.totalWaitTime / 1000 / 60).toFixed(2);
  const waitPercentage = data.waitPercentage || (data.totalTime > 0 ? ((data.totalWaitTime / data.totalTime) * 100).toFixed(1) : '0');
  const formattedDate = formatDate(data.date || new Date().toISOString().split('T')[0]);
  
  card.innerHTML = `
    <div class="site-title">${site}</div>
    <div class="time-info">总使用时间: <span class="total-time">${totalTimeMinutes} 分钟</span></div>
    <div class="time-info">等待时间: <span class="wait-time">${waitTimeMinutes} 分钟</span></div>
    <div class="time-info">等待占比: ${waitPercentage}%</div>
    <div class="time-info" style="font-size: 10px; color: #999;">更新时间: ${formattedDate}</div>
  `;
  
  return card;
}

function setupEventListeners() {
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      chrome.storage.local.set({ aiUsageData: {} }, () => {
        loadData();
        alert('数据已清空');
      });
    }
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}