class TimeTracker {
  constructor() {
    this.startTime = null;
    this.waitStartTime = null;
    this.totalTime = 0; // kept for backward-compat display, computed from totalActiveTime
    this.totalWaitTime = 0;
    this.currentSite = this.detectSite();
    this.initialized = false;
    this.isWaiting = false;
    this.observer = null;
    this.observers = []; // store all observers so we can disconnect
    this.isActive = true;
    this.lastActivityTime = Date.now();
    this.inactivityTimer = null;
    this.inactivityThreshold = 5 * 60 * 1000;

    // new fields for correct segmented time accumulation
    this.activeStart = null; // timestamp when current active segment started
    this.totalActiveTime = 0; // accumulated active time in ms

    // UI / listener handles
    this.buttonInterval = null;
    this.listenersAttached = false;
  }

  detectSite() {
    const host = window.location.hostname.toLowerCase();
    const url = window.location.href.toLowerCase();
    if (host.includes('doubao.com') || url.includes('doubao.com')) return '豆包';
    if (host.includes('yuanbao.tencent.com') || url.includes('yuanbao.tencent.com')) return '元宝';
    if (host.includes('chat.openai.com') || host.includes('chatgpt.com') || url.includes('chat.openai.com')) return 'ChatGPT';
    if (host.includes('claude.ai') || url.includes('claude.ai')) return 'Claude';
    if (host.includes('gemini.google.com') || url.includes('gemini') || url.includes('gemini.google.com')) return 'Gemini';
    return 'Unknown';
  }

  async startTracking() {
    if (!this.initialized && this.currentSite !== 'Unknown') {
      this.initialized = true;
      // load persisted data first
      await this.loadData();

      // start a new active segment
      this.activeStart = Date.now();
      this.lastActivityTime = Date.now();

      this.setupEventListeners();
      this.setupMutationObserver();
      this.createFloatingButton();
      this.setupActivityListeners();
      this.startInactivityTimer();
      console.log(`${this.currentSite} 时间追踪已启动`);
    }
  }

  setupActivityListeners() {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onPageInactive();
      } else {
        this.onPageActive();
      }
    });

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.onUserActivity();
      }, { passive: true });
    });
  }

  onPageActive() {
    if (!this.activeStart) {
      this.activeStart = Date.now();
    }
    this.isActive = true;
    this.lastActivityTime = Date.now();
    this.startInactivityTimer();
    console.log(`${this.currentSite} 页面已激活，继续计时`);
  }

  onPageInactive() {
    // accumulate the active segment
    if (this.activeStart) {
      this.totalActiveTime += Date.now() - this.activeStart;
      this.activeStart = null;
    }
    this.isActive = false;
    this.resetInactivityTimer();
    console.log(`${this.currentSite} 页面已暂停，停止计时`);
    this.saveData();
  }

  onUserActivity() {
    this.isActive = true;
    this.lastActivityTime = Date.now();
    this.resetInactivityTimer();
    this.startInactivityTimer();
    if (!this.activeStart) this.activeStart = Date.now();
  }

  startInactivityTimer() {
    this.resetInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      this.onInactivityTimeout();
    }, this.inactivityThreshold);
  }

  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  onInactivityTimeout() {
    if (this.isActive) {
      const timeSinceLastActivity = Date.now() - this.lastActivityTime;
      if (timeSinceLastActivity >= this.inactivityThreshold) {
        // treat as inactive: accumulate active segment
        if (this.activeStart) {
          this.totalActiveTime += Date.now() - this.activeStart;
          this.activeStart = null;
        }
        this.isActive = false;
        console.log(`${this.currentSite} 超过${this.inactivityThreshold/60000}分钟无活动，停止计时`);
        this.saveData();
      }
    }
  }

  createFloatingButton() {
    if (document.getElementById('waitdash-floating-button')) return;

    const button = document.createElement('div');
    button.id = 'waitdash-floating-button';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #4CAF50;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s ease;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
      this.showUsageStats();
    });

    this.updateButtonText(button);
    this.buttonInterval = setInterval(() => {
      this.updateButtonText(button);
    }, 60000);

    document.body.appendChild(button);
  }

  updateButtonText(button) {
    const now = Date.now();
    const totalActive = this.computeTotalActive(now);
    this.totalTime = totalActive; // keep for backward compatibility
    if (totalActive > 0) {
      const totalTimeMinutes = (totalActive / 1000 / 60).toFixed(0);
      button.textContent = `${totalTimeMinutes}分`;
    } else {
      button.textContent = '0分';
    }
  }

  showUsageStats() {
    const now = Date.now();
    const totalActive = this.computeTotalActive(now);
    this.totalTime = totalActive; // sync

    const statsPanel = document.createElement('div');
    statsPanel.id = 'waitdash-stats-panel';
    statsPanel.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 300px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    const totalTimeMinutes = (totalActive / 1000 / 60).toFixed(2);
    const waitTimeMinutes = (this.totalWaitTime / 1000 / 60).toFixed(2);
    const waitPercentage = totalActive > 0 ? ((this.totalWaitTime / totalActive) * 100).toFixed(1) : '0';
    const statusText = this.isActive ? '运行中' : '已暂停';
    const statusColor = this.isActive ? '#4CAF50' : '#9E9E9E';

    statsPanel.innerHTML = `
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 12px; color: #333;">${this.currentSite} 使用统计</div>
      <div style="font-size: 14px; margin-bottom: 8px; color: #666;">状态: <span style="font-weight: bold; color: ${statusColor};">${statusText}</span></div>
      <div style="font-size: 14px; margin-bottom: 8px; color: #666;">总使用时间: <span style="font-weight: bold; color: #4CAF50;">${totalTimeMinutes} 分钟</span></div>
      <div style="font-size: 14px; margin-bottom: 8px; color: #666;">等待时间: <span style="font-weight: bold; color: #f44336;">${waitTimeMinutes} 分钟</span></div>
      <div style="font-size: 14px; margin-bottom: 16px; color: #666;">等待占比: ${waitPercentage}%</div>
      <button id="waitdash-close-btn" style="
        width: 100%;
        padding: 8px;
        background-color: #f1f1f1;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
      ">关闭</button>
    `;

    document.body.appendChild(statsPanel);

    document.getElementById('waitdash-close-btn').addEventListener('click', () => {
      statsPanel.remove();
    });

    // remove after 30s by default
    setTimeout(() => {
      if (document.getElementById('waitdash-stats-panel')) {
        statsPanel.remove();
      }
    }, 30000);
  }

  setupEventListeners() {
    this.setupInputListeners();
    this.setupCustomSiteListeners();
  }

  setupInputListeners() {
    // prevent duplicate listeners
    if (this._inputListenersInitialized) return;
    this._inputListenersInitialized = true;

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Submit') {
        this.startWaitTime();
      }
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'BUTTON') {
              this.checkAndAddSendButtonListener(node);
            }
            node.querySelectorAll && node.querySelectorAll('button').forEach(button => {
              this.checkAndAddSendButtonListener(button);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  checkAndAddSendButtonListener(button) {
    try {
      const buttonText = (button.textContent || '').toLowerCase();
      if (buttonText.includes('发送') || buttonText.includes('submit') || buttonText.includes('send') || buttonText.includes('ask') || buttonText.includes('提问')) {
        button.addEventListener('click', () => {
          this.startWaitTime();
        });
      }
    } catch (e) {
      // ignore
    }
  }

  setupCustomSiteListeners() {
    switch (this.currentSite) {
      case '豆包':
        this.setupDoubaoListeners();
        break;
      case '元宝':
        this.setupYuanbaoListeners();
        break;
      case 'ChatGPT':
        this.setupChatGPTListeners();
        break;
      case 'Claude':
        this.setupClaudeListeners();
        break;
      case 'Gemini':
        this.setupGeminiListeners();
        break;
    }
  }

  setupDoubaoListeners() {
    console.log('设置豆包监听器');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            node.querySelectorAll && node.querySelectorAll('button').forEach(button => {
              const buttonText = (button.textContent || '').toLowerCase();
              if (buttonText.includes('发送') || buttonText.includes('提问') || buttonText.includes('ask')) {
                button.addEventListener('click', () => { this.startWaitTime(); });
              }
            });

            if (node.classList && (node.classList.contains('message') || node.classList.contains('response') || node.classList.contains('answer') || node.classList.contains('result') || node.classList.contains('chat-message'))) {
              if (node.textContent && node.textContent.length > 50) {
                this.endWaitTime();
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.observers.push(observer);

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Submit') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          this.startWaitTime();
        }
      }
    });
  }

  setupYuanbaoListeners() {
    console.log('设置元宝监听器');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            node.querySelectorAll && node.querySelectorAll('button').forEach(button => {
              const buttonText = (button.textContent || '').toLowerCase();
              if (buttonText.includes('发送') || buttonText.includes('提问') || buttonText.includes('ask') || buttonText.includes('send')) {
                button.addEventListener('click', () => { this.startWaitTime(); });
              }
            });

            if (node.classList && (node.classList.contains('message') || node.classList.contains('response') || node.classList.contains('answer') || node.classList.contains('result') || node.classList.contains('yuanbao-message'))) {
              if (node.textContent && node.textContent.length > 50) {
                this.endWaitTime();
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.observers.push(observer);

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Submit') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          this.startWaitTime();
        }
      }
    });
  }

  setupChatGPTListeners() {
    console.log('设置ChatGPT监听器');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            node.querySelectorAll && node.querySelectorAll('button').forEach(button => {
              const buttonText = (button.textContent || '').toLowerCase();
              const buttonClass = (button.className || '').toLowerCase();
              if (buttonText.includes('send') || buttonText.includes('submit') || buttonText.includes('ask') || buttonClass.includes('send') || buttonClass.includes('submit')) {
                button.addEventListener('click', () => { this.startWaitTime(); });
              }
            });

            if (node.classList && (node.classList.contains('message') || node.classList.contains('response') || node.classList.contains('answer') || node.classList.contains('result') || node.classList.contains('chatgpt-message') || node.classList.contains('assistant-message'))) {
              if (node.textContent && node.textContent.length > 50) {
                this.endWaitTime();
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.observers.push(observer);

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Submit') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          this.startWaitTime();
        }
      }
    });
  }

  setupClaudeListeners() {
    console.log('设置Claude监听器');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            node.querySelectorAll && node.querySelectorAll('button').forEach(button => {
              const buttonText = (button.textContent || '').toLowerCase();
              const buttonClass = (button.className || '').toLowerCase();
              if (buttonText.includes('send') || buttonText.includes('submit') || buttonText.includes('ask') || buttonClass.includes('send') || buttonClass.includes('submit')) {
                button.addEventListener('click', () => { this.startWaitTime(); });
              }
            });

            if (node.classList && (node.classList.contains('message') || node.classList.contains('response') || node.classList.contains('answer') || node.classList.contains('result') || node.classList.contains('claude-message') || node.classList.contains('assistant-message'))) {
              if (node.textContent && node.textContent.length > 50) {
                this.endWaitTime();
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.observers.push(observer);

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Submit') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          this.startWaitTime();
        }
      }
    });
  }

  setupGeminiListeners() {
    console.log('设置Gemini监听器');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            node.querySelectorAll && node.querySelectorAll('button').forEach(button => {
              const buttonText = (button.textContent || '').toLowerCase();
              const buttonClass = (button.className || '').toLowerCase();
              if (buttonText.includes('send') || buttonText.includes('submit') || buttonText.includes('ask') || buttonText.includes('发送') || buttonClass.includes('send') || buttonClass.includes('submit')) {
                button.addEventListener('click', () => { this.startWaitTime(); });
              }
            });

            if (node.classList && (node.classList.contains('message') || node.classList.contains('response') || node.classList.contains('answer') || node.classList.contains('result') || node.classList.contains('gemini-message') || node.classList.contains('model-response'))) {
              if (node.textContent && node.textContent.length > 50) {
                this.endWaitTime();
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.observers.push(observer);

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Submit') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          this.startWaitTime();
        }
      }
    });
  }

  setupMutationObserver() {
    // main observer to detect generated responses across sites
    if (this.observer) return;
    this.observer = new MutationObserver((mutations) => {
      let hasSignificantChange = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && (node.classList.contains('message') || node.classList.contains('response') || node.classList.contains('answer') || node.classList.contains('result'))) {
                hasSignificantChange = true;
              }
              if (node.textContent && node.textContent.length > 50) {
                hasSignificantChange = true;
              }
            }
          });
        }
      });
      if (hasSignificantChange) this.endWaitTime();
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
    this.observers.push(this.observer);
  }

  startWaitTime() {
    if (!this.isWaiting) {
      this.waitStartTime = Date.now();
      this.isWaiting = true;
      console.log('等待时间开始计算');
    }
  }

  endWaitTime() {
    if (this.isWaiting && this.waitStartTime) {
      const waitDuration = Date.now() - this.waitStartTime;
      if (waitDuration > 1000) {
        this.totalWaitTime += waitDuration;
        console.log(`等待时间结束，本次等待: ${Math.round(waitDuration/1000)}秒`);
        this.saveData();
      }
      this.waitStartTime = null;
      this.isWaiting = false;
    }
  }

  stopTracking() {
    // accumulate any running active segment
    if (this.activeStart) {
      this.totalActiveTime += Date.now() - this.activeStart;
      this.activeStart = null;
    }

    // sync totalTime for compatibility
    this.totalTime = this.totalActiveTime;

    this.endWaitTime();
    this.saveData();

    // disconnect observers
    try {
      (this.observers || []).forEach(o => { try { o.disconnect(); } catch (e) {} });
      this.observers = [];
    } catch (e) {}

    // clear ui interval
    if (this.buttonInterval) {
      clearInterval(this.buttonInterval);
      this.buttonInterval = null;
    }

    console.log(`${this.currentSite} 时间追踪已停止`);
  }

  // helper to compute total active time including current segment
  computeTotalActive(now = Date.now()) {
    return this.totalActiveTime + (this.activeStart ? (now - this.activeStart) : 0);
  }

  async loadData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const data = await new Promise((resolve) => chrome.storage.local.get(['waitdash_stats'], resolve));
        const all = data && data.waitdash_stats ? data.waitdash_stats : {};
        const siteData = all[this.currentSite];
        if (siteData) {
          const today = new Date().toISOString().split('T')[0];
          const todayData = siteData[today];
          if (todayData) {
            this.totalActiveTime = todayData.totalActiveTime || 0;
            this.totalWaitTime = todayData.totalWaitTime || 0;
          }
        }
      } catch (e) {
        console.log('加载数据失败:', e);
      }
    }
  }

  async saveData() {
    if (!this.initialized || this.currentSite === 'Unknown') return;

    // compute totals
    const now = Date.now();
    const totalActive = this.computeTotalActive(now);
    this.totalTime = totalActive; // keep legacy field

    const payload = {
      site: this.currentSite,
      totalActiveTime: totalActive,
      totalWaitTime: this.totalWaitTime,
      waitPercentage: totalActive > 0 ? (this.totalWaitTime / totalActive) * 100 : 0,
      timestamp: now,
      date: new Date(now).toISOString().split('T')[0]
    };

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'saveData', site: this.currentSite, data: payload }, (response) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            const error = chrome.runtime.lastError;
            if (error.message && error.message.includes('Extension context invalidated')) {
              console.log('插件上下文已失效，跳过数据保存');
            } else {
              console.log('保存数据失败:', error);
            }
          } else if (response && response.success) {
            console.log('数据已通过消息发送到后台');
          }
        });
      }
    } catch (error) {
      // ignore
    }
  }
}

const tracker = new TimeTracker();
tracker.startTracking();

window.addEventListener('beforeunload', () => {
  tracker.stopTracking();
});