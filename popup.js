document.addEventListener('DOMContentLoaded', () => {
  injectPopupStyles();
  loadData();
  setupEventListeners();
});

// 注入样式，避免修改 popup.html
function injectPopupStyles() {
  if (document.getElementById('waitdash-popup-styles')) return;
  const style = document.createElement('style');
  style.id = 'waitdash-popup-styles';
  style.textContent = `
    :root{ --bg:#f7f9fc; --card:#fff; --muted:#7a7f85; --accent:#4caf50; --accent-2:#2196f3; --danger:#f44336; }
    html,body{ height:100%; }
    body{ margin:0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:var(--bg); color:#222; min-width:380px; }
    #data-container{ padding:12px; max-height:460px; overflow:auto; box-sizing:border-box; }
    .site-card{ background:var(--card); border-radius:10px; padding:12px; margin-bottom:10px; box-shadow: 0 1px 6px rgba(16,24,40,0.06); display:flex; flex-direction:column; border-left:6px solid #e0e0e0; }
    .site-row{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .site-title{ font-weight:600; font-size:14px; color:#111; }
    .site-meta{ font-size:12px; color:var(--muted); }
    .time-info{ font-size:13px; color:#333; }
    .small{ font-size:12px; color:var(--muted); }
    .progress{ height:8px; background:#eee; border-radius:6px; overflow:hidden; margin-top:8px; }
    .progress > i{ display:block; height:100%; background:linear-gradient(90deg,var(--accent),#7bd389); }
    .stat-grid{ display:flex; gap:8px; }
    .stat-item{ flex:1; background:linear-gradient(180deg,rgba(0,0,0,0.02),transparent); padding:8px; border-radius:6px; text-align:center; }
    .stat-value{ font-weight:700; font-size:14px; }
    .button{ background:var(--accent-2); border:none; color:#fff; padding:8px 10px; border-radius:8px; cursor:pointer; font-weight:600; }
    .empty-state{ text-align:center; color:var(--muted); padding:28px 12px; }
    /* controls container placed outside scrollable area */
    #waitdash-controls{ padding:8px 12px; display:flex; justify-content:flex-end; gap:8px; }
    .clear-small{ display:inline-block; background:transparent; color:var(--accent-2); border:1px solid rgba(33,150,243,0.12); padding:6px 8px; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px; }
  `;
  document.head.appendChild(style);

  // ensure there's a single controls container (no title)
  if (!document.getElementById('waitdash-controls')) {
    const controls = document.createElement('div');
    controls.id = 'waitdash-controls';

    // create clear button and place controls after data-container (to avoid affecting scrolling)
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clear-btn';
    clearBtn.className = 'clear-small';
    clearBtn.textContent = '清空数据';
    controls.appendChild(clearBtn);

    const dataContainer = document.getElementById('data-container');
    if (dataContainer && dataContainer.parentNode) {
      dataContainer.parentNode.insertBefore(controls, dataContainer.nextSibling);
    } else {
      document.body.insertBefore(controls, document.body.firstChild);
    }
  }
}

let currentTabUrl = '';
let allData = {};

function loadData() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentTabUrl = tabs[0].url;
    }

    chrome.storage.local.get(['waitdash_stats'], (result) => {
      const stats = result.waitdash_stats || {};
      const normalized = {};

      Object.keys(stats).forEach(site => {
        const siteData = stats[site];
        normalized[site] = [];
        
        Object.keys(siteData).forEach(date => {
          const dayData = siteData[date];
          normalized[site].push({
            totalTime: Number(dayData.totalActiveTime || 0),
            totalWaitTime: Number(dayData.totalWaitTime || 0),
            waitPercentage: Number(dayData.totalActiveTime) > 0 ? (Number(dayData.totalWaitTime || 0) / Number(dayData.totalActiveTime || 0)) * 100 : 0,
            date: dayData.date || date,
            timestamp: dayData.lastSaved || Date.now()
          });
        });
      });

      allData = normalized;
      displayData();
    });
  });
}

function displayData() {
  const dataContainer = document.getElementById('data-container');
  
  if (Object.keys(allData).length === 0) {
    dataContainer.innerHTML = '<div class="empty-state">暂无数据，请先使用AI服务</div>';
    return;
  }
  
  dataContainer.innerHTML = '';
  
  const currentSite = getCurrentSiteFromUrl(currentTabUrl);
  
  if (currentSite && allData[currentSite] && allData[currentSite].length > 0) {
    const sortedData = [...allData[currentSite]].sort((a, b) => b.timestamp - a.timestamp);
    const latestData = sortedData[0];
    const siteCard = createSiteCard(currentSite, latestData, true);
    dataContainer.appendChild(siteCard);
  }
  
  const totalStats = calculateTotalStats(allData);
  if (totalStats) {
    const totalCard = createTotalStatsCard(totalStats);
    dataContainer.appendChild(totalCard);
  }
}

function getCurrentSiteFromUrl(url) {
  if (url.includes('doubao.com')) return '豆包';
  if (url.includes('yuanbao.tencent.com')) return '元宝';
  if (url.includes('chatgpt.com')) return 'ChatGPT';
  if (url.includes('claude.ai')) return 'Claude';
  if (url.includes('gemini.google.com')) return 'Gemini';
  return null;
}

function calculateTotalStats(usageData) {
  let totalTime = 0;
  let totalWaitTime = 0;
  let siteCount = 0;
  
  Object.keys(usageData).forEach(site => {
    const siteData = usageData[site];
    if (siteData.length > 0) {
      const sortedData = [...siteData].sort((a, b) => b.timestamp - a.timestamp);
      const latestData = sortedData[0];
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
  // ensure numeric
  const total = Number(stats.totalTime || 0);
  const wait = Number(stats.totalWaitTime || 0);
  const pct = Number(stats.waitPercentage || 0);

  const card = document.createElement('div');
  card.className = 'site-card';
  card.style.borderLeftColor = 'var(--accent-2)';

  const totalTimeMinutes = (total / 1000 / 60).toFixed(2);
  const waitTimeMinutes = (wait / 1000 / 60).toFixed(2);
  const waitPercentage = pct.toFixed(1);
  const avgWait = (pct / (stats.siteCount || 1)).toFixed(1);

  card.innerHTML = `
    <div class="site-row">
      <div>
        <div class="site-title">总计 <span class="small">(${stats.siteCount} 个网站)</span></div>
        <div class="site-meta">汇总最近数据</div>
      </div>
      <div class="stat-grid" style="min-width:150px;">
        <div class="stat-item"><div class="small">总时长</div><div class="stat-value">${totalTimeMinutes} 分</div></div>
        <div class="stat-item"><div class="small">等待</div><div class="stat-value" style="color:var(--danger);">${waitTimeMinutes} 分</div></div>
      </div>
    </div>
    <div style="margin-top:8px; display:flex; align-items:center; justify-content:space-between;">
      <div class="small">等待占比</div>
      <div style="font-weight:700;">${waitPercentage}%</div>
    </div>
    <div class="progress"><i style="width:${Math.min(100, Math.max(0, pct))}%"></i></div>
    <div style="margin-top:8px; text-align:right; font-size:12px; color:var(--muted);">平均等待占比: ${avgWait}%</div>
  `;

  return card;
}

function createSiteCard(site, data, isCurrent) {
  // normalize numeric values
  const t = Number(data.totalTime || data.totalActiveTime || 0);
  const w = Number(data.totalWaitTime || 0);
  const pct = typeof data.waitPercentage !== 'undefined' ? Number(data.waitPercentage) : (t > 0 ? (w / t) * 100 : 0);
  const totalTimeMinutes = (t / 1000 / 60).toFixed(2);
  const waitTimeMinutes = (w / 1000 / 60).toFixed(2);
  const waitPercentage = pct.toFixed(1);
  const formattedDate = formatDate(data.date || new Date().toISOString().split('T')[0]);

  const card = document.createElement('div');
  card.className = 'site-card';
  card.style.borderLeftColor = isCurrent ? 'var(--accent)' : '#9E9E9E';

  card.innerHTML = `
    <div class="site-row">
      <div>
        <div class="site-title">${site} ${isCurrent ? '<span class="small">(当前)</span>' : ''}</div>
        <div class="site-meta">更新时间: ${formattedDate}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700; font-size:14px;">${totalTimeMinutes} 分钟</div>
        <div class="small">等待 ${waitTimeMinutes} 分钟</div>
      </div>
    </div>
    <div style="margin-top:6px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="small">等待占比</div>
        <div style="font-weight:700;">${waitPercentage}%</div>
      </div>
      <div class="progress"><i style="width:${Math.min(100, Math.max(0, pct))}%"></i></div>
    </div>
  `;

  return card;
}

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.id === 'clear-btn') {
      if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
        chrome.storage.local.set({ aiUsageData: {}, waitdash_stats: {} }, () => {
          loadData();
          alert('数据已清空');
        });
      }
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