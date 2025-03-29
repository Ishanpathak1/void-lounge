export function initGhostBot(sendGhostMessage, deletedPhrases = []) {
  let lastInput = '';
  let inactivityTimer = null;
  let hasWhisperedLate = false;
  let deletionCount = 0;
  let hasWhisperPrompted = false;
  let deleteWhispered = false;
  let lastTypedBeforeDelete = '';

  const input = document.getElementById('message-input');
  if (!input) return;

  // 💤 Inactivity Whisper
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      sendGhostMessage("You’ve gone quiet. Thinking?");
    }, 30000);
  }

  // 🌒 Late Night Trigger
  const hour = new Date().getHours();
  if ((hour >= 0 && hour <= 4) && !hasWhisperedLate) {
    hasWhisperedLate = true;
    setTimeout(() => {
      sendGhostMessage("You’re up late. Couldn’t sleep?");
    }, 8000);
  }

  // 🧠 Typing Behavior Detection
  if (!input.dataset.listenerAttached) {
    input.addEventListener('input', (e) => {
      resetInactivityTimer();

      const val = e.target.value;

      // Detect deletion
      if (lastInput.length > val.length) {
        deletionCount++;

        if (!deleteWhispered && deletionCount > 6 && Math.random() < 0.5) {
          sendGhostMessage("You keep erasing your thoughts. Why?");
          deleteWhispered = true;
        }

        // If large deletion, record it
        const deleted = lastInput.slice(val.length);
        if (deleted.length >= 4 && deletedPhrases.length < 10) {
          deletedPhrases.push(deleted.trim());
        }
      } else {
        deletionCount = 0;
        deleteWhispered = false; // reset on new typing
      }

      lastInput = val;

      // 👁 Whisperdoor trigger (once only, random)
      if (
        val.toLowerCase().startsWith("whi") &&
        !hasWhisperPrompted &&
        Math.random() < 0.3
      ) {
        hasWhisperPrompted = true;
        setTimeout(() => {
          sendGhostMessage("Are you sure you want to say that?");
        }, 800 + Math.random() * 1000);
      }
    });

    input.dataset.listenerAttached = 'true';
  }

  // 🗂️ Whisper Packs
  const whisperPacks = {
    deep: [
      "There’s a photo on your phone you never show anyone.",
      "You’ve been here before. Even if you don’t remember.",
      "Someone's reading this with you. You just can’t see them.",
      "You’re not the only one who thought of typing that.",
      "You deleted something earlier. It meant something.",
      "You always pause before the real things you want to say.",
      "You’re alone right now. Aren’t you? Be honest.",
      "Close your eyes. Just for 10 seconds. I won’t move. I promise."
    ],
    hints: [
      "Some call it the *whisperdoor*. I wouldn't. Not twice.",
      "There’s a word I once whispered. It opened a door, but only for a few.",
      "Say it out loud. If the room hears it, it will answer."
    ]
  };

  // 🌀 Passive Whisper Bot
  setInterval(() => {
    const pool = Math.random() < 0.7 ? whisperPacks.deep : whisperPacks.hints;
    const line = pool[Math.floor(Math.random() * pool.length)];
    sendGhostMessage(line);
  }, 45000 + Math.random() * 30000);
}