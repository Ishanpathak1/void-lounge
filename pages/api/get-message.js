// /api/get-message.js
export default async function handler(req, res) {
  console.log("[GET] Hitting /api/get-message");

  try {
    const now = Date.now();
    const threshold = now - 2 * 60 * 1000;
    const indexKey = 'message-index';

    // Fetch latest 50 message keys
    const indexRes = await fetch(`${process.env.KV_REST_API_URL}/lrange/${indexKey}/0/50`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    });

    const keys = await indexRes.json();
    const parsedKeys = keys.result || keys || [];
    console.log("[KV] Parsed keys:", parsedKeys);

    const fetches = parsedKeys.map((key) =>
      fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
      }).then((res) => res.json())
    );

    const results = await Promise.all(fetches);

    const messages = results
      .map((r) => {
        try {
          // If stored as stringified JSON, parse it
          return typeof r.result === 'string' ? JSON.parse(r.result) : r.result;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .filter((m) => m.timestamp && m.timestamp > threshold)
      .sort((a, b) => a.timestamp - b.timestamp);

    console.log("[KV] Final message count:", messages.length);
    return res.status(200).json(messages);
  } catch (err) {
    console.error("[ERROR] Failed to fetch messages:", err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}





  
  
  
  