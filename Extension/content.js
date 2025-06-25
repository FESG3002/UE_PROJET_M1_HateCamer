const API_URL = 'https://fesg1234-hate-camer.hf.space/detect-hate';

let isActive = false;
let hateMessagesStorage = new Map();
let currentConversationId = null;
let periodicCheckInterval = null;
let lastActivityTime = Date.now();

function generateMessageId(messageElement) {
  const dataId = messageElement.getAttribute('data-id');
  if (dataId) return dataId;
  
  const textElement = messageElement.querySelector('.copyable-text') || 
                     messageElement.querySelector('[data-pre-plain-text]') ||
                     messageElement.querySelector('.selectable-text');
  
  const text = textElement ? (textElement.textContent || textElement.innerText) : '';
  const timestamp = messageElement.querySelector('[data-pre-plain-text]')?.getAttribute('data-pre-plain-text') || Date.now();
  
  return `msg_${btoa(text.substring(0, 50) + timestamp).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
}

function getCurrentConversationId() {
  const conversationHeader = document.querySelector('[data-tab="6"] header') ||
                            document.querySelector('header[data-testid="conversation-header"]') ||
                            document.querySelector('[data-tab="6"] [title]');
  
  if (conversationHeader) {
    const titleElement = conversationHeader.querySelector('[title]') || 
                        conversationHeader.querySelector('span[dir="auto"]');
    if (titleElement) {
      return btoa(titleElement.textContent || titleElement.title).replace(/[^a-zA-Z0-9]/g, '');
    }
  }
  
  const urlHash = window.location.hash;
  return urlHash ? btoa(urlHash).replace(/[^a-zA-Z0-9]/g, '') : 'default_conversation';
}

async function detectHateSpeech(messageText) {
  if (!messageText || messageText.trim().length < 2) return null;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: messageText }),
    });

    if (!response.ok) {
      console.error('API request failed:', response.statusText);
      return null;
    }

    const result = await response.json();

    if (result.error) {
      console.error('API error:', result.error);
      return null;
    }

    return {
      isHate: result.isHate,
      detectedWord: result.isHate ? 'Contenu inapproprié' : null,
      suggestion: result.suggestion || 'Exprimez-vous de manière plus respectueuse',
      confidence: result.confidence || null,
    };
  } catch (error) {
    console.error('Error calling hate detection API:', error);
    return null;
  }
}

function createCorrectionElement(suggestion) {
  const correctionDiv = document.createElement('div');
  correctionDiv.className = 'hate-correction';
  correctionDiv.style.cssText = `
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 6px 10px;
    margin-top: 5px;
    font-size: 12px;
    color: #856404;
    display: flex;
    align-items: center;
    gap: 5px;
    position: relative;
    z-index: 1;
  `;
  
  correctionDiv.innerHTML = `
    <span style="color: #e17055;">⚠️</span>
    <span><strong>Suggestion:</strong> ${suggestion}</span>
  `;
  
  return correctionDiv;
}

function applyHateMessageStyle(container, hateData) {
  const mainContainer = container.closest('[data-id]');
  if (!mainContainer || mainContainer.hasAttribute('data-hate-annotated')) {
    return;
  }
  
  mainContainer.setAttribute('data-hate-annotated', 'true');
  
  mainContainer.style.cssText += `
    background-color: #ffebee !important;
    border-left: 4px solid #f44336 !important;
    border-radius: 10px !important;
    padding: 8px !important;
    margin: 4px 0 !important;
    box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2) !important;
    transition: all 0.3s ease !important;
  `;
  
  if (!mainContainer.querySelector('.hate-indicator')) {
    const indicator = document.createElement('div');
    indicator.className = 'hate-indicator';
    indicator.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      background: #f44336;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 10;
    `;
    indicator.innerHTML = '⚠';
    mainContainer.style.position = 'relative';
    mainContainer.appendChild(indicator);
  }
  
  if (!mainContainer.querySelector('.hate-correction')) {
    const correctionElement = createCorrectionElement(hateData.suggestion);
    const messageContent = mainContainer.querySelector('.copyable-text')?.parentElement ||
                          mainContainer.querySelector('.selectable-text')?.parentElement ||
                          mainContainer.querySelector('[data-id] > div');
    if (messageContent) {
      messageContent.appendChild(correctionElement);
    }
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedAnalyzeAndColorizeMessages = debounce(analyzeAndColorizeMessages, 300);

async function analyzeAndColorizeMessages() {
  if (!isActive) return;

  const conversationId = getCurrentConversationId();
  const messageContainers = document.querySelectorAll('[data-id]');

  for (const container of messageContainers) {
    if (container.hasAttribute('data-hate-annotated')) continue;

    const messageId = generateMessageId(container);
    const fullMessageId = `${conversationId}_${messageId}`;

    if (hateMessagesStorage.has(fullMessageId)) {
      const storedData = hateMessagesStorage.get(fullMessageId);
      if (storedData.isHate) {
        applyHateMessageStyle(container, storedData);
      }
      continue;
    }

    let messageText = '';
    // Check if the message is a reply (has a quoted message)
    const quotedMessage = container.querySelector('._aju2');
    if (quotedMessage) {
      // Extract only the response text from the reply (excluding the quoted part)
      const responseElement = container.querySelector('._akbu .selectable-text') ||
                             container.querySelector('._akbu .copyable-text');
      if (responseElement) {
        messageText = responseElement.textContent || responseElement.innerText;
        console.log(`Analyzing response text: "${messageText}"`);
      }
    } else {
      // For single messages (no reply), extract the full message text
      const textElement = container.querySelector('.copyable-text') ||
                         container.querySelector('[data-pre-plain-text]') ||
                         container.querySelector('.selectable-text');
      if (textElement) {
        messageText = textElement.textContent || textElement.innerText;
        console.log(`Analyzing single message text: "${messageText}"`);
      }
    }

    if (!messageText || messageText.trim().length < 2) continue;

    const hateAnalysis = await detectHateSpeech(messageText);

    if (hateAnalysis) {
      hateMessagesStorage.set(fullMessageId, hateAnalysis);
      if (hateAnalysis.isHate) {
        applyHateMessageStyle(container, hateAnalysis);
        console.log(`Message haineux détecté: "${messageText.substring(0, 50)}..." - Suggestion: "${hateAnalysis.suggestion}"`);
      }
    } else {
      hateMessagesStorage.set(fullMessageId, { isHate: false });
    }
  }
}

function cleanCurrentMessageStyles() {
  document.querySelectorAll('.hate-indicator').forEach(el => el.remove());
  document.querySelectorAll('.hate-correction').forEach(el => el.remove());

  document.querySelectorAll('[data-hate-annotated]').forEach(container => {
    container.style.backgroundColor = '';
    container.style.borderLeft = '';
    container.style.borderRadius = '';
    container.style.padding = '';
    container.style.margin = '';
    container.style.boxShadow = '';
    container.style.position = '';
    container.removeAttribute('data-hate-annotated');
  });
}

function resetAllStyles() {
  cleanCurrentMessageStyles();
  hateMessagesStorage.clear();
}

function detectConversationChange() {
  const newConversationId = getCurrentConversationId();
  if (currentConversationId !== newConversationId) {
    console.log(`Changement de conversation détecté: ${currentConversationId} -> ${newConversationId}`);
    currentConversationId = newConversationId;
    
    lastActivityTime = Date.now();
    cleanCurrentMessageStyles();
    
    setTimeout(() => {
      if (isActive) {
        debouncedAnalyzeAndColorizeMessages();
      }
    }, 500);
  }
}

const observer = new MutationObserver((mutations) => {
  if (!isActive) return;

  let hasNewMessages = false;
  let hasConversationChange = false;

  lastActivityTime = Date.now();

  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.hasAttribute('data-id') || 
              (node.querySelector && node.querySelector('[data-id]'))) {
            hasNewMessages = true;
          }
          if (node.querySelector && 
              (node.querySelector('header[data-testid="conversation-header"]') ||
               node.querySelector('[data-tab="6"] header'))) {
            hasConversationChange = true;
          }
        }
      });
    }

    if (mutation.type === 'attributes' && 
        (mutation.target.hasAttribute('data-tab') || 
         mutation.target.classList.contains('active'))) {
      hasConversationChange = true;
    }
  });

  if (hasConversationChange) {
    setTimeout(detectConversationChange, 300);
  }

  if (hasNewMessages) {
    debouncedAnalyzeAndColorizeMessages();
  }
});

let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    setTimeout(detectConversationChange, 500);
  }
});

const observerConfig = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['data-tab', 'class', 'data-id']
};

function startHateDetector() {
  isActive = true;
  currentConversationId = getCurrentConversationId();
  lastActivityTime = Date.now();

  debouncedAnalyzeAndColorizeMessages();

  const chatContainer = document.querySelector('[data-tab="1"]') || 
                       document.querySelector('#main') || 
                       document.querySelector('div[role="main"]') ||
                       document.body;

  if (chatContainer) {
    observer.observe(chatContainer, observerConfig);
  }

  urlObserver.observe(document.body, { childList: true, subtree: false });

  const sidebar = document.querySelector('[data-tab="3"]') || 
                 document.querySelector('div[data-testid="chat-list"]');
  if (sidebar) {
    observer.observe(sidebar, { childList: true, subtree: true });
  }

  startPeriodicCheck();
  
  console.log('Détecteur de messages haineux WhatsApp activé avec persistance');
}

function stopHateDetector() {
  isActive = false;
  cleanCurrentMessageStyles();
  observer.disconnect();
  urlObserver.disconnect(); // Corrected from urlMutationObserver
  stopPeriodicCheck();
  console.log('Détecteur de messages haineux WhatsApp désactivé');
}
function startPeriodicCheck() {
  stopPeriodicCheck();
  
  periodicCheckInterval = setInterval(() => {
    if (!isActive) return;
    
    const timeSinceLastActivity = Date.now() - lastActivityTime;
    const minInactiveTime = 10000;
    
    if (timeSinceLastActivity > minInactiveTime) {
      const unannotatedMessages = document.querySelectorAll('[data-id]:not([data-hate-annotated])');
      if (unannotatedMessages.length > 0) {
        console.log('Vérification périodique : messages non annotés détectés');
        debouncedAnalyzeAndColorizeMessages();
      }
    }
  }, 8000);
}

function stopPeriodicCheck() {
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval);
    periodicCheckInterval = null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    if (isActive) {
      stopHateDetector();
    } else {
      startHateDetector();
    }
    sendResponse({ active: isActive });
  } else if (request.action === 'getStatus') {
    sendResponse({ active: isActive });
  } else if (request.action === 'clearStorage') {
    resetAllStyles();
    sendResponse({ cleared: true });
  }
});

if (window.location.hostname === 'web.whatsapp.com') {
  const checkWhatsAppLoaded = setInterval(() => {
    const chatArea = document.querySelector('[data-tab="1"]') || 
                    document.querySelector('#main') ||
                    document.querySelector('[role="textbox"]');
    
    if (chatArea) {
      clearInterval(checkWhatsAppLoaded);
      console.log('WhatsApp Web détecté, détecteur de messages haineux prêt');
      currentConversationId = getCurrentConversationId();
    }
  }, 1000);
}