console.log('[BOOT] main.js loaded 🚀');

window.addEventListener('DOMContentLoaded', async () => {
  console.log('[DOM READY] ✅ DOM fully loaded');

  // DOM references
  const input = document.getElementById('message-input');
  const form = document.getElementById('chat-form');
  const container = document.getElementById('message-container');
  const dashboard = document.getElementById('user-dashboard');
  const toggle = document.getElementById('dashboard-toggle');

  console.log('[DEBUG] DOM Elements:', {
    input,
    form,
    container,
    dashboard,
    toggle
  });

  // If critical elements are missing, exit early
  if (!form || !input || !container) {
    console.error('[ERROR] Missing essential DOM elements!');
    return;
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[SUBMIT] Form submit triggered ✅');

    const text = input.value.trim();
    if (!text) {
      console.log('[SUBMIT] Ignored empty input');
      return;
    }

    console.log('[SUBMIT] Input text:', text);

    // Example fake render to test DOM message display
    const msg = document.createElement('div');
    msg.classList.add('message');
    msg.textContent = `🧪 ${text}`;
    container.appendChild(msg);

    input.value = '';
  });

  // Toggle dashboard visibility
  toggle?.addEventListener('click', () => {
    dashboard?.classList.toggle('hidden');
    console.log('[TOGGLE] Dashboard toggled:', !dashboard?.classList.contains('hidden'));
  });

  console.log('[READY] main.js fully initialized ✅');
});







