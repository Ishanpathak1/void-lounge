// /api/get-message.js
export default async function handler(req, res) {
    try {
      const now = Date.now();
      const threshold = now - 2 * 60 * 1000;
      const indexKey = 'message-index';
  
      // Fetch latest 50 message keys
      const indexRes = await fetch(`${process.env.KV_REST_API_URL}/lrange/${indexKey}/0/50`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
      });
  
      const keys = await indexRes.json();
      if (!Array.isArray(keys.result)) {
        throw new Error("Invalid message index");
      }
  
      // Fetch each message
      const fetches = keys.result.map((key) =>
        fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        }).then(res => res.json())
      );
  
      const results = await Promise.all(fetches);
      const messages = results
        .map(r => r.result)
        .filter(Boolean)
        .filter(m => m.timestamp > threshold)
        .sort((a, b) => a.timestamp - b.timestamp);
  
      return res.status(200).json(messages);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
  
  
  
  