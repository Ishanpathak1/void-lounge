import Gun from 'gun';
import { initGhostBot } from './ghostBot.js';
import { createUserIdentity } from './identity.js';

// Initialize GUN
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const chat = gun.get('void-lounge');
const users = gun.get('void-lounge-users');

// 🎮 User Identity & Score
const { id: myId, emoji, score: myScoreStart } = createUserIdentity(gun);
let myScore = myScoreStart;

// DOM Elements
const input = document.getElementById('message-input');
const form = document.getElementById('chat-form');
const container = document.getElementById('message-container');
const dashboard = document.getElementById('user-dashboard');
const toggle = document.getElementById('dashboard-toggle');

let chaosMode = false;
let theme = 'default';
let currentRoom = 'main';
const enteredRooms = new Set();
const portalAttempts = {};
const messageHistory = [];
const MAX_HISTORY = 10;
const MAX_AGE_MS = 2 * 60 * 1000; // 2 minutes
let showDashboard = false;

// 🧿 Push presence
setInterval(() => {
  users.get(myId).put({
    emoji,
    score: myScore,
    lastPing: Date.now()
  });
}, 4000);

function addToHistory(text) {
  if (text.startsWith("👁")) return;
  messageHistory.push(text);
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift();
  }
}

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

// 📤 Message Send
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim().toLowerCase();
  if (!text) return;

  if (portals[text]) {
    if (enteredRooms.has(text)) {
      input.value = '';
      return;
    }
    portalAttempts[text] = (portalAttempts[text] || 0) + 1;

    if (portalAttempts[text] >= 2) {
      enterRoom(text);
      sendGhostMessage(`☁ You’ve entered: ${portals[text].name}`);
      enteredRooms.add(text);
      myScore += 1;
    } else {
      sendGhostMessage("The room didn’t open. Try again… if you dare.");
    }

    input.value = '';
    return;
  }

  chat.set({ text, timestamp: Date.now() });
  input.value = '';
  myScore += 1;

  if (isTriggerMessage(text)) {
    try {
      const res = await fetch('http://localhost:3001/api/ghost-reactive', {
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
      console.warn("Ghost reactive whisper failed:", err);
    }
  }
});

// 🧼 GUN Replay Filter
chat.map().on((data) => {
  if (!data || !data.text || !data.timestamp) return;
  const now = Date.now();
  if (now - data.timestamp > MAX_AGE_MS) return;
  addToHistory(data.text);
  renderMessage(data.text);
});

// 🚪 Enter Portal Room
function enterRoom(key) {
  const portal = portals[key];
  if (!portal) return;
  container.className = '';
  document.body.className = '';
  document.body.style.background = portal.bg;
  container.classList.add(portal.class);
  currentRoom = key;
}

// 💬 Render Message
function renderMessage(text, options = {}) {
  const msg = document.createElement('div');
  msg.classList.add('message');
  if (Math.random() < 0.3) msg.classList.add('warp');

  msg.textContent = options.ghost ? `👁 ${text}` : text;
  const y = window.innerHeight * 0.4 + Math.random() * window.innerHeight * 0.2;
  msg.style.top = `${y}px`;

  const xOffset = Math.floor(Math.random() * 300) - 150;
  msg.style.left = '50%';

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

// 🧠 Passive AI Ghost
setInterval(async () => {
  if (messageHistory.length < 4) return;
  try {
    const res = await fetch('http://localhost:3001/api/ghost-passive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messageHistory })
    });
    const result = await res.json();
    if (result?.whisper) sendGhostMessage(result.whisper);
  } catch (err) {
    console.warn("Ghost passive whisper failed:", err);
  }
}, 150000);

// 👁 Floating Presence Dashboard
if (dashboard && toggle) {
  toggle.addEventListener('click', () => {
    showDashboard = !showDashboard;
    dashboard.classList.toggle('hidden', !showDashboard);
  });

  const allUsers = {};

  function updateDashboard(data) {
    if (!showDashboard) return;
    const now = Date.now();
    const usersList = [];

    data.forEach(({ emoji, score, lastPing }) => {
      if (!emoji || !lastPing || now - lastPing > 10000) return;
      usersList.push({ emoji, score });
    });

    usersList.sort((a, b) => b.score - a.score);

    dashboard.innerHTML = usersList
      .map(u => `${u.emoji} — ${u.score} pts`)
      .join('<br>') || 'No one... yet.';
  }

  users.map().on((data, key) => {
    if (!data || !data.emoji || !data.lastPing) return;
    allUsers[key] = { ...data, id: key };
    updateDashboard(Object.values(allUsers));
  });
}