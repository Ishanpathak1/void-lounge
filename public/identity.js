// public/identity.js

const EMOJIS = ['👁', '🌑', '👻', '🌀', '🕸', '☁️', '🧠', '🧿', '🫧', '🌫️', '🔮'];

export function createUserIdentity() {
  let identity = JSON.parse(localStorage.getItem('void-identity') || 'null');

  if (!identity) {
    const id = crypto.randomUUID();
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    identity = { id, emoji, score: 0 };
    localStorage.setItem('void-identity', JSON.stringify(identity));
  }

  return identity;
}
