// /api/get-messages.js

export default async function handler(req, res) {
    const now = Date.now();
    const threshold = now - 2 * 60 * 1000; // last 2 mins
  
    try {
      const response = await fetch(`${process.env.KV_REST_API_URL}/keys?prefix=message-`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
      });
      const keys = await response.json();
  
      const recentKeys = keys.filter((k) => {
        const ts = parseInt(k.split('-')[1]);
        return ts && ts > threshold;
      });
  
      const fetches = recentKeys.map((key) =>
        fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        }).then(res => res.json())
      );
  
      const results = await Promise.all(fetches);
      const messages = results
        .map(r => r.result)
        .filter(Boolean)
        .sort((a, b) => a.timestamp - b.timestamp);
  
      return res.status(200).json({ messages });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
  
  