console.log('[BOOT] main.js loaded 🚀');

window.addEventListener('DOMContentLoaded', () => {
  console.log('[DOM READY] ✅ DOM fully loaded');

  const input = document.getElementById('message-input');
  const form = document.getElementById('chat-form');
  const container = document.getElementById('message-container');
  const dashboard = document.getElementById('user-dashboard');
  const toggle = document.getElementById('dashboard-toggle');

  const messageHistory = [];
  const MAX_HISTORY = 10;
  const portals = {
    whisperdoor: { name: 'Whisper Door', bg: '#140022', class: 'room-whisperdoor' },
    underneath: { name: 'Underneath', bg: '#001016', class: 'room-underneath' }
  };

  let showDashboard = false;
  let currentRoom = 'main';
  const enteredRooms = new Set();
  const portalAttempts = {};
  let chaosMode = false;

  console.log('[DEBUG] DOM Elements:', { input, form, container, dashboard, toggle });

  // Submit Chat
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    console.log('[SUBMIT] Input:', text);

    const portalKey = text.toLowerCase();
    if (portals[portalKey]) {
      portalAttempts[portalKey] = (portalAttempts[portalKey] || 0) + 1;
      if (portalAttempts[portalKey] >= 2 && !enteredRooms.has(portalKey)) {
        enterRoom(portalKey);
        enteredRooms.add(portalKey);
        renderMessage(`☁ You’ve entered: ${portals[portalKey].name}`, { ghost: true });
      } else {
        renderMessage("The room didn’t open. Try again… if you dare.", { ghost: true });
      }
      input.value = '';
      return;
    }

    // Send to backend
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, timestamp: Date.now() })
      });
      const result = await res.json();
      console.log('[SEND] Response:', result);
    } catch (err) {
      console.error('[SEND ERROR]', err);
    }

    input.value = '';
    addToHistory(text);

    if (isTriggerMessage(text)) {
      try {
        const res = await fetch('/api/ghost-reactive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, context: messageHistory.slice(-5) })
        });
        const data = await res.json();
        if (data?.whisper) renderMessage(data.whisper, { ghost: true });
      } catch (err) {
        console.warn('[GHOST ERROR]', err);
      }
    }
  });

  // Render Message
  function renderMessage(text, options = {}) {
    const msg = document.createElement('div');
    msg.classList.add('message');
    if (Math.random() < 0.3) msg.classList.add('warp');
    msg.textContent = options.ghost ? `👁 ${text}` : text;

    const y = window.innerHeight * 0.6 + Math.random() * window.innerHeight * 0.3;
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

  function addToHistory(text) {
    if (text.startsWith("👁")) return;
    messageHistory.push(text);
    if (messageHistory.length > MAX_HISTORY) messageHistory.shift();
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

  function enterRoom(key) {
    const portal = portals[key];
    if (!portal) return;
    container.className = '';
    document.body.className = '';
    document.body.style.background = portal.bg;
    container.classList.add(portal.class);
    currentRoom = key;
  }

  // Fetch Live Messages
  async function fetchMessages() {
    try {
      const res = await fetch('/api/get-message');
      const messages = await res.json();
      console.log('[LIVE FETCH]', messages);
  
      messages.forEach(({ text }) => renderMessage(text));
    } catch (err) {
      console.error('[FETCH ERROR]', err);
    }
  }
  

  // Poll every 5s for new messages
  setInterval(fetchMessages, 5000);
  fetchMessages(); // Initial load

  // Toggle Dashboard
  toggle?.addEventListener('click', () => {
    dashboard?.classList.toggle('hidden');
    showDashboard = !dashboard?.classList.contains('hidden');
    console.log('[DASHBOARD]', showDashboard ? 'Shown' : 'Hidden');
  });

  console.log('[READY] main.js fully initialized ✅');
});










