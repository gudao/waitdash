class TimeTracker {
  constructor() {
    this.startTime = null;
    this.waitStartTime = null;
    this.totalTime = 0;
    this.totalWaitTime = 0;
    this.currentSite = this.detectSite();
    this.initialized = false;
    this.isWaiting = false;
    this.observer = null;
  }

  detectSite() {
    const url = window.location.href;
    if (url.includes('doubao.com')) return '豆包';
    if (url.includes('yuanbao.tencent.com')) return '元宝';
    if (url.includes('chat.openai.com')) return 'ChatGPT';
    if (url.includes('claude.ai')) return 'Claude';
    if (url.includes('gemini.google.com')) return 'Gemini';
    return 'Unknown';
  }

  startTracking() {
    if (!this.initialized && this.currentSite !== 'Unknown') {
      this.initialized = true;
      this.startTime = Date.now();
      this.setupEventListeners();
      this.setupMutationObserver();
      console.log(`${this.currentSite} 时间追踪已启动`);
    }
  }

  setupEventListeners() {
    this.setupInputListeners();
    this.setupCustomSiteListeners();
  }

  setupInputListeners() {
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
            node.querySelectorAll('button').forEach(button => {
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
  }

  checkAndAddSendButtonListener(button) {
    const buttonText = button.textContent.toLowerCase();
    if (buttonText.includes('发送') || buttonText.includes('submit') || buttonText.includes('send') || buttonText.includes('ask') || buttonText.includes('提问')) {
      button.addEventListener('click', () => {
        this.startWaitTime();
      });
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
            const sendButtons = node.querySelectorAll('button');
            sendButtons.forEach(button => {
              const buttonText = button.textContent.toLowerCase();
              if (buttonText.includes('发送') || buttonText.includes('提问') || buttonText.includes('ask')) {
                button.addEventListener('click', () => {
                  this.startWaitTime();
                });
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
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
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
            const sendButtons = node.querySelectorAll('button');
            sendButtons.forEach(button => {
              const buttonText = button.textContent.toLowerCase();
              if (buttonText.includes('发送') || buttonText.includes('提问') || buttonText.includes('ask') || buttonText.includes('send')) {
                button.addEventListener('click', () => {
                  this.startWaitTime();
                });
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
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
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
            const sendButtons = node.querySelectorAll('button');
            sendButtons.forEach(button => {
              const buttonText = button.textContent.toLowerCase();
              const buttonClass = button.className;
              if (buttonText.includes('send') || buttonText.includes('submit') || buttonText.includes('ask') || buttonClass.includes('send') || buttonClass.includes('submit')) {
                button.addEventListener('click', () => {
                  this.startWaitTime();
                });
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
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
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
            const sendButtons = node.querySelectorAll('button');
            sendButtons.forEach(button => {
              const buttonText = button.textContent.toLowerCase();
              const buttonClass = button.className;
              if (buttonText.includes('send') || buttonText.includes('submit') || buttonText.includes('ask') || buttonClass.includes('send') || buttonClass.includes('submit')) {
                button.addEventListener('click', () => {
                  this.startWaitTime();
                });
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
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
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
            const sendButtons = node.querySelectorAll('button');
            sendButtons.forEach(button => {
              const buttonText = button.textContent.toLowerCase();
              const buttonClass = button.className;
              if (buttonText.includes('send') || buttonText.includes('submit') || buttonText.includes('ask') || buttonText.includes('发送') || buttonClass.includes('send') || buttonClass.includes('submit')) {
                button.addEventListener('click', () => {
                  this.startWaitTime();
                });
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
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
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
      
      if (hasSignificantChange) {
        this.endWaitTime();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
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
    if (this.startTime) {
      this.totalTime = Date.now() - this.startTime;
      this.endWaitTime();
      this.saveData();
      if (this.observer) {
        this.observer.disconnect();
      }
      console.log(`${this.currentSite} 时间追踪已停止`);
    }
  }

  saveData() {
    if (!this.initialized || this.currentSite === 'Unknown') return;
    
    const data = {
      site: this.currentSite,
      totalTime: this.totalTime,
      totalWaitTime: this.totalWaitTime,
      waitPercentage: this.totalTime > 0 ? (this.totalWaitTime / this.totalTime) * 100 : 0,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };

    chrome.storage.local.get('aiUsageData', (result) => {
      try {
        const usageData = result.aiUsageData || {};
        if (!usageData[this.currentSite]) {
          usageData[this.currentSite] = [];
        }
        
        usageData[this.currentSite].push(data);
        
        if (usageData[this.currentSite].length > 100) {
          usageData[this.currentSite] = usageData[this.currentSite].slice(-100);
        }
        
        chrome.storage.local.set({ aiUsageData: usageData }, () => {
          console.log('数据已保存');
        });
      } catch (error) {
        console.error('保存数据失败:', error);
      }
    });
  }
}

const tracker = new TimeTracker();
tracker.startTracking();

window.addEventListener('beforeunload', () => {
  tracker.stopTracking();
});