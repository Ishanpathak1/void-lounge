// /api/send-message.js

export default async function handler(req, res) {
  const { text, timestamp } = req.body;

  if (!text || !timestamp) {
    return res.status(400).json({ error: 'Missing text or timestamp' });
  }

  const key = `message-${timestamp}`;
  const payload = {
    text,
    timestamp: Number(timestamp)
  };

  try {
    // Store message (as JSON object)
    const storeRes = await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
      },
      body: JSON.stringify(payload) // ✅ store as proper object
    });

    // Push key to message index
    await fetch(`${process.env.KV_REST_API_URL}/lpush/message-index`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
      },
      body: key
    });

    const result = await storeRes.json();
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("[ERROR] Failed to store message:", err);
    return res.status(500).json({ error: 'Failed to store message' });
  }
}


  
  
  