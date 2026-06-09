/**
 * NexusAI Chatbot — Frontend JavaScript
 * Stateless LangChain chatbot (no memory)
 */

// =============================================
// DOM References
// =============================================
const messagesArea   = document.getElementById('messagesArea');
const messagesList   = document.getElementById('messagesList');
const welcomeScreen  = document.getElementById('welcomeScreen');
const userInput      = document.getElementById('userInput');
const sendBtn        = document.getElementById('sendBtn');
const clearBtn       = document.getElementById('clearBtn');
const newChatBtn     = document.getElementById('newChatBtn');
const statusDot      = document.getElementById('statusDot');
const statusText     = document.getElementById('statusText');
const sidebar        = document.getElementById('sidebar');
const mobileMenuBtn  = document.getElementById('mobileMenuBtn');
const sidebarToggle  = document.getElementById('sidebarToggle');

// =============================================
// State
// =============================================
let isLoading = false;
let messageCount = 0;

// =============================================
// Sidebar Toggle (Mobile)
// =============================================
function createOverlay() {
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeSidebar);
  }
  return overlay;
}

function openSidebar() {
  sidebar.classList.add('open');
  createOverlay().classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) overlay.classList.remove('show');
}

mobileMenuBtn.addEventListener('click', openSidebar);
sidebarToggle.addEventListener('click', closeSidebar);

// =============================================
// Auto-resize textarea
// =============================================
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 160) + 'px';
  sendBtn.disabled = !userInput.value.trim() || isLoading;
});

// =============================================
// Keyboard shortcuts
// =============================================
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) sendMessage();
  }
});

// =============================================
// Suggestion chips
// =============================================
document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    userInput.value = chip.dataset.msg;
    userInput.dispatchEvent(new Event('input'));
    sendMessage();
  });
});

// =============================================
// New Chat / Clear
// =============================================
function resetChat() {
  messagesList.innerHTML = '';
  messageCount = 0;
  welcomeScreen.style.display = 'flex';
  messagesList.style.display = 'none';
  setStatus('ready');
}

clearBtn.addEventListener('click', () => {
  if (messageCount > 0 && confirm('Clear all messages?')) {
    resetChat();
  }
});

newChatBtn.addEventListener('click', () => {
  resetChat();
  closeSidebar();
  userInput.focus();
});

// =============================================
// Status helpers
// =============================================
function setStatus(state) {
  const states = {
    ready: { text: 'Ready', dot: '' },
    thinking: { text: 'Thinking...', dot: 'thinking' },
    error: { text: 'Error', dot: 'error' },
  };
  const s = states[state] || states.ready;
  statusText.textContent = s.text;
  statusDot.className = 'status-dot' + (s.dot ? ` ${s.dot}` : '');
}

// =============================================
// Error toast
// =============================================
let toastTimer;
function showError(msg) {
  let toast = document.querySelector('.error-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'error-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

// =============================================
// Time formatter
// =============================================
function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// =============================================
// Markdown-lite renderer (basic formatting)
// =============================================
function renderMarkdown(text) {
  let html = escapeHtml(text);
  // Code blocks (```...```)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);
  // Inline code (`...`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold (**...**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic (*...*)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  return html;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// =============================================
// Render a message bubble
// =============================================
function appendMessage(role, text) {
  if (messageCount === 0) {
    welcomeScreen.style.display = 'none';
    messagesList.style.display = 'flex';
  }
  messageCount++;

  const isUser = role === 'user';
  const wrapper = document.createElement('div');
  wrapper.className = `message ${isUser ? 'user' : 'ai'}`;
  wrapper.setAttribute('role', 'listitem');

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';

  if (isUser) {
    avatar.textContent = 'U';
  } else {
    avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>`;
  }

  const content = document.createElement('div');
  content.className = 'message-content';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (isUser) {
    bubble.textContent = text;
  } else {
    bubble.innerHTML = renderMarkdown(text);
  }

  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = formatTime();

  content.appendChild(bubble);
  content.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(content);
  messagesList.appendChild(wrapper);

  scrollToBottom();
  return wrapper;
}

// =============================================
// Thinking indicator
// =============================================
function showThinking() {
  const wrapper = document.createElement('div');
  wrapper.className = 'thinking-indicator';
  wrapper.id = 'thinkingIndicator';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>`;

  const bubble = document.createElement('div');
  bubble.className = 'thinking-bubble';
  bubble.innerHTML = `
    <div class="thinking-dot"></div>
    <div class="thinking-dot"></div>
    <div class="thinking-dot"></div>
  `;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messagesList.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}

function removeThinking() {
  const el = document.getElementById('thinkingIndicator');
  if (el) el.remove();
}

// =============================================
// Scroll to bottom
// =============================================
function scrollToBottom() {
  messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
}

// =============================================
// Send message
// =============================================
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  // Clear input
  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;
  isLoading = true;

  // Show user message
  appendMessage('user', text);

  // Update UI state
  setStatus('thinking');
  const thinkingEl = showThinking();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    removeThinking();

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail || `HTTP ${response.status}`);
    }

    const data = await response.json();
    appendMessage('ai', data.response);
    setStatus('ready');

  } catch (err) {
    removeThinking();
    setStatus('error');
    showError(`⚠️ ${err.message}`);
    appendMessage('ai', `Sorry, I encountered an error: **${err.message}**\n\nPlease check your API key in the \`.env\` file and try again.`);
    setTimeout(() => setStatus('ready'), 3000);
  } finally {
    isLoading = false;
    sendBtn.disabled = !userInput.value.trim();
    userInput.focus();
  }
}

// =============================================
// Send button click
// =============================================
sendBtn.addEventListener('click', sendMessage);

// =============================================
// Init
// =============================================
userInput.focus();
resetChat();
