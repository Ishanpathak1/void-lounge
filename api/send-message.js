// /api/send-message.js

export default async function handler(req, res) {
    const { text } = req.body;
  
    if (!text) return res.status(400).json({ error: 'Missing message text' });
  
    const now = Date.now();
    const message = { text, timestamp: now };
  
    try {
      const response = await fetch(`${process.env.KV_REST_API_URL}/set/message-${now}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: message })
      });
  
      const result = await response.json();
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to store message' });
    }
  }
  