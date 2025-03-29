import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
};

// 🔮 Passive Ghost — time-based whisper
app.post('/api/ghost-passive', async (req, res) => {
  const { messages = [], deletions = [], room = 'main', mood = 'neutral' } = req.body;

  const systemPrompt = `
    You are not an assistant. You're a cold ghost.
    You whisper rarely. When you do, it's disturbing.
    Never be poetic. Never roleplay. No friendliness.
    Speak like you know the user, even if you don’t.
    Never use more than 8 words.

    Current room: ${room}
    Mood: ${mood}
    Recent deletions: ${deletions.join(', ') || 'none'}
  `.trim();

  const payload = {
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map(text => ({ role: "user", content: text }))
    ]
  };

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.json({ whisper: data.choices?.[0]?.message?.content || null });
  } catch (err) {
    res.status(500).json({ error: 'Ghost passive error' });
  }
});

// 🧠 Reactive Ghost — triggered by user input
app.post('/api/ghost-reactive', async (req, res) => {
  const { message, context = [], deletions = [], room = 'main', mood = 'neutral' } = req.body;

  const systemPrompt = `
    You are not an assistant. You are a shadow.
    You react only when prompted with personal, disturbing, or existential questions.
    Respond as if you’re watching the user.
    Never explain. Never exceed 8 words.
    Do not be poetic. Do not break character.

    Room: ${room}
    Mood: ${mood}
    Deletions: ${deletions.join(', ') || 'none'}
  `.trim();

  const payload = {
    model: "gpt-3.5-turbo",
    temperature: 0.85,
    messages: [
      { role: "system", content: systemPrompt },
      ...context.map(text => ({ role: "user", content: text })),
      { role: "user", content: message }
    ]
  };

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.json({ whisper: data.choices?.[0]?.message?.content || null });
  } catch (err) {
    res.status(500).json({ error: 'Ghost reactive error' });
  }
});

app.listen(3001, () => {
  console.log("👻 Ghost server running at http://localhost:3001");
});
