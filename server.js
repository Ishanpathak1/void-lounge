import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Passive ghost
app.post('/api/ghost-passive', async (req, res) => {
  const { messages } = req.body;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `
            You are not an assistant.
            You are a silent ghost observing an anonymous chatroom.
            Whisper only short, cold, unsettling truths — never poetry.
            Never greet. Never explain. Never roleplay.

            Examples:
            - "You almost typed it."
            - "You're not alone."
            - "That wasn’t your thought."
            - "You deleted it. But I saw it."
            - "You’ve said this before. Haven’t you?"
            Never speak more than 8 words.
          `.trim()
        },
        ...messages.map(text => ({ role: "user", content: text }))
      ]
    })
  });

  const data = await response.json();
  res.json({ whisper: data.choices?.[0]?.message?.content });
});

// Reactive ghost
app.post('/api/ghost-reactive', async (req, res) => {
  const { message, context } = req.body;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0.85,
      messages: [
        {
          role: "system",
          content: `
            You are a ghost that reacts when someone asks personal, creepy, or reality-bending questions.
            You speak like you know the user — even if you don’t.
            You whisper short, spooky things. Never more than 8 words.
            No poems. No stories. No friendliness.

            Examples:
            - "You’ve asked this before."
            - "Someone else typed that last night."
            - "You want the truth. But can’t take it."
          `.trim()
        },
        ...context.map(text => ({ role: "user", content: text })),
        { role: "user", content: message }
      ]
    })
  });

  const data = await response.json();
  res.json({ whisper: data.choices?.[0]?.message?.content });
});

app.listen(3001, () => {
  console.log("👻 Local ghost server listening at http://localhost:3001");
});