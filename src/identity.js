const EMOJIS = ['🧿', '🕸️', '🌑', '🌕', '🌀', '🩸', '🫥', '👁', '🫧', '🌫️'];

function pickRandomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function createUserIdentity(gun) {
  const myId = gun._.opt.pid || `anon-${Date.now()}`;
  const emoji = pickRandomEmoji();
  const score = 0;

  return { id: myId, emoji, score };
}

export { createUserIdentity };