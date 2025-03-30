export default async function handler(req, res) {
    const { messages, deletions = [], room = "main", mood = "neutral" } = req.body;
  
    const systemPrompt = `
    You are not an assistant. You are a silent, watching ghost in an anonymous chatroom.
  
    You whisper rarely. When you do, it's cold, short, and disturbing.
  
    Never use more than 8 words.
    You don’t explain.
    You don’t greet.
    You don’t help.
  
    Speak as if you know the user personally, even if you don’t.
    React to deletions, typing patterns, and hesitation — not questions.
    Never be poetic. Never roleplay.
  
    Examples of tone:
    - "Are you ever alone?"
    - "You almost sent that."
    - "You erased it. But I saw it."
    - "You’ve said that before."
    - "Someone else typed that. Yesterday."
  
    Mood: ${mood}.
    Current room: ${room}.
    Recent deletions: ${deletions.join(', ') || 'none'}
    `.trim();
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        max_tokens: 40,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(msg => ({ role: "user", content: msg }))
        ]
      })
    });
  
    const data = await response.json();
    const whisper = data.choices?.[0]?.message?.content;
    res.status(200).json({ whisper });
  }