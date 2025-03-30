import { initGhostBot } from './ghostBot.js';
import { createUserIdentity } from './identity.js';

console.log('[BOOT] main.js loaded 🚀');

window.addEventListener('DOMContentLoaded', () => {
  console.log('[DOM READY] ✅ DOM fully loaded');

  const input = document.getElementById('message-input');
  const form = document.getElementById('chat-form');
  const container = document.getElementById('message-container');
  const dashboard = document.getElementById('user-dashboard');
  const toggle = document.getElementById('dashboard-toggle');

  console.log('[DEBUG] DOM Elements:', { input, form, container, dashboard, toggle });

  const { id: myId, emoji, score: myScoreStart } = createUserIdentity();
  let myScore = myScoreStart;

  let chaosMode = false;
  let currentRoom = 'main';
  let showDashboard = false;

  const enteredRooms = new Set();
  const portalAttempts = {};
  const messageHistory = [];
  const seenMessages = new Set();
  const MAX_HISTORY = 10;

  const portals = {
    whisperdoor: { name: 'Whisper Door', bg: '#140022', class: 'room-whisperdoor' },
    underneath: { name: 'Underneath', bg: '#001016', class: 'room-underneath' }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[SUBMIT] Form submit triggered ✅');

    const text = input.value.trim();
    if (!text) return;
    console.log('[SUBMIT] Input text:', text);

    const portalKey = text.toLowerCase();
    if (portals[portalKey]) {
      portalAttempts[portalKey] = (portalAttempts[portalKey] || 0) + 1;
      if (portalAttempts[portalKey] >= 2 && !enteredRooms.has(portalKey)) {
        enterRoom(portalKey);
        enteredRooms.add(portalKey);
        sendGhostMessage(`☁ You’ve entered: ${portals[portalKey].name}`);
        myScore += 1;
      } else {
        sendGhostMessage("The room didn’t open. Try again… if you dare.");
      }
      input.value = '';
      return;
    }

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, timestamp: Date.now() })
      });
      const data = await res.json();
      console.log('[SEND] API response:', data);
    } catch (err) {
      console.error('[SEND ERROR]', err);
    }

    input.value = '';
    myScore += 1;

    if (isTriggerMessage(text)) {
      try {
        const res = await fetch('/api/ghost-reactive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, context: messageHistory.slice(-5) })
        });
        const result = await res.json();
        console.log('[GHOST REACTIVE]', result);
        if (result?.whisper) {
          sendGhostMessage(result.whisper);
          myScore += 2;
        }
      } catch (err) {
        console.warn('[GHOST REACTIVE ERROR]', err);
      }
    }
  });

  async function fetchMessages() {
    try {
      const res = await fetch('/api/get-message');
      const raw = await res.text();
      const { messages } = JSON.parse(raw);

      messages.forEach(({ text, timestamp }) => {
        if (!seenMessages.has(timestamp)) {
          seenMessages.add(timestamp);
          addToHistory(text);
          renderMessage(text);
        }
      });
    } catch (err) {
      console.error('[FETCH ERROR]', err);
    }
  }

  fetchMessages();
  setInterval(fetchMessages, 3000); // 🟡 Poll every 3s

  function renderMessage(text, options = {}) {
    console.log('[RENDER] Showing message:', { text, options });

    const msg = document.createElement('div');
    msg.classList.add('message');
    if (Math.random() < 0.3) msg.classList.add('warp');

    msg.textContent = options.ghost ? `👁 ${text}` : text;

    const y = window.innerHeight * 0.7 + Math.random() * window.innerHeight * 0.25;
    msg.style.top = `${y}px`;
    msg.style.left = '50%';

    const xOffset = Math.floor(Math.random() * 300) - 150;
    const transforms = [`translateX(${xOffset}px)`];
    if (chaosMode || options.ghost) {
      const hue = options.ghost ? 220 : Math.floor(Math.random() * 360);
      transforms.push(
        `rotate(${Math.random() * 20 - 10}deg)`,
        `scale(${1 + Math.random() * 0.5})`
      );
      msg.style.color = `hsl(${hue}, 100%, 75%)`;
      msg.style.textShadow = `0 0 10px hsl(${hue}, 100%, 75%)`;
    }

    msg.style.transform = transforms.join(' ');
    container.appendChild(msg);
    setTimeout(() => msg.remove(), 12000);
  }

  function sendGhostMessage(text) {
    console.log('[GHOST] Whisper sent:', text);
    renderMessage(text, { ghost: true });
  }

  function enterRoom(key) {
    const portal = portals[key];
    if (!portal) return;
    console.log('[PORTAL] Entering room:', key);
    container.className = '';
    document.body.className = '';
    document.body.style.background = portal.bg;
    container.classList.add(portal.class);
    currentRoom = key;
  }

  function addToHistory(text) {
    if (text.startsWith('👁')) return;
    messageHistory.push(text);
    if (messageHistory.length > MAX_HISTORY) {
      messageHistory.shift();
    }
  }

  function isTriggerMessage(text) {
    const patterns = [
      /am i (alone|being watched|real)/i,
      /is anyone (here|watching)/i,
      /who (are you|is this)/i,
      /can you hear me/i,
      /is this real/i
    ];
    return patterns.some((regex) => regex.test(text));
  }

  setInterval(async () => {
    if (messageHistory.length < 4) return;
    try {
      const res = await fetch('/api/ghost-passive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageHistory })
      });
      const result = await res.json();
      console.log('[GHOST PASSIVE]', result);
      if (result?.whisper) sendGhostMessage(result.whisper);
    } catch (err) {
      console.warn('[GHOST PASSIVE ERROR]', err);
    }
  }, 150000);

  toggle.addEventListener('click', () => {
    showDashboard = !showDashboard;
    dashboard.classList.toggle('hidden', !showDashboard);
    console.log('[DASHBOARD] Toggled:', showDashboard);
  });

  setInterval(async () => {
    try {
      const res = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: myId, emoji, score: myScore })
      });
      const result = await res.json();
      console.log('[PRESENCE UPDATE]', result);
    } catch (err) {
      console.warn('[PRESENCE ERROR]', err);
    }
  }, 5000);

  setInterval(async () => {
    try {
      const res = await fetch('/api/presence');
      const users = await res.json();
      if (!showDashboard) return;

      const now = Date.now();
      const active = users
        .filter(u => now - u.lastPing < 10000)
        .sort((a, b) => b.score - a.score);

      dashboard.innerHTML = active
        .map(u => `${u.emoji} — ${u.score} pts`)
        .join('<br>') || 'No one... yet.';
    } catch (err) {
      console.warn('[DASHBOARD FETCH ERROR]', err);
    }
  }, 6000);

  initGhostBot(sendGhostMessage);
  console.log('[READY] main.js fully initialized ✅');
});



