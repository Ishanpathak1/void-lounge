// /api/send-message.js
export default async function handler(req, res) {
    const { text, timestamp } = req.body;
    const key = `message-${timestamp}`;
    const indexKey = `message-index`;
  
    try {
      // Save the message
      await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        body: JSON.stringify({ text, timestamp })
      });
  
      // Append to message index (LPUSH)
      await fetch(`${process.env.KV_REST_API_URL}/lpush/${indexKey}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        body: JSON.stringify(key)
      });
  
      return res.status(200).json({ success: true, data: { result: "OK" } });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to store message' });
    }
  }
  
  