import { initGhostBot } from './ghostBot.js';
import { createUserIdentity } from './identity.js';

const { id: myId, emoji, score: myScoreStart } = createUserIdentity();
let myScore = myScoreStart;

const input = document.getElementById('message-input');
const form = document.getElementById('chat-form');
const container = document.getElementById('message-container');
const dashboard = document.getElementById('user-dashboard');
const toggle = document.getElementById('dashboard-toggle');

let chaosMode = false;
let theme = 'default';
let currentRoom = 'main';
let showDashboard = false;

const enteredRooms = new Set();
const portalAttempts = {};
const messageHistory = [];
const MAX_HISTORY = 10;

// 🌀 Secret Portals
const portals = {
  whisperdoor: {
    name: 'Whisper Door',
    bg: '#140022',
    class: 'room-whisperdoor',
  },
  underneath: {
    name: 'Underneath',
    bg: '#001016',
    class: 'room-underneath',
  }
};

// 🚀 Send Message
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Portals
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

  // Send to backend
  await fetch('/api/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, timestamp: Date.now() })
  });

  input.value = '';
  myScore += 1;

  if (isTriggerMessage(text)) {
    try {
      const res = await fetch('/api/ghost-reactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: messageHistory.slice(-5)
        })
      });
      const result = await res.json();
      if (result?.whisper) {
        sendGhostMessage(result.whisper);
        myScore += 2;
      }
    } catch (err) {
      console.warn('Reactive ghost failed:', err);
    }
  }
});

// 🎯 Render messages on load
async function fetchMessages() {
  const res = await fetch('/api/get-message');
  const messages = await res.json();
  messages.forEach(({ text }) => {
    addToHistory(text);
    renderMessage(text);
  });
}
fetchMessages();

// 👁 Display Message
function renderMessage(text, options = {}) {
  const msg = document.createElement('div');
  msg.classList.add('message');
  if (Math.random() < 0.3) msg.classList.add('warp');
  msg.textContent = options.ghost ? `👁 ${text}` : text;

  const y = window.innerHeight * 0.4 + Math.random() * window.innerHeight * 0.2;
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
  renderMessage(text, { ghost: true });
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

function addToHistory(text) {
  if (text.startsWith("👁")) return;
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

initGhostBot(sendGhostMessage);

// 👻 Passive AI Ghost
setInterval(async () => {
  if (messageHistory.length < 4) return;
  try {
    const res = await fetch('/api/ghost-passive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messageHistory })
    });
    const result = await res.json();
    if (result?.whisper) sendGhostMessage(result.whisper);
  } catch (err) {
    console.warn('Passive ghost failed:', err);
  }
}, 150000);

// 📊 Presence Dashboard
toggle.addEventListener('click', () => {
  showDashboard = !showDashboard;
  dashboard.classList.toggle('hidden', !showDashboard);
});

async function updatePresence() {
  await fetch('/api/presence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: myId, emoji, score: myScore })
  });
}
setInterval(updatePresence, 5000);

async function fetchPresence() {
  const res = await fetch('/api/presence');
  const users = await res.json();
  if (!showDashboard) return;

  const now = Date.now();
  const activeUsers = users
    .filter(u => now - u.lastPing < 10000)
    .sort((a, b) => b.score - a.score);

  dashboard.innerHTML = activeUsers
    .map(u => `${u.emoji} — ${u.score} pts`)
    .join('<br>') || 'No one... yet.';
}
setInterval(fetchPresence, 6000);
