// pages/api/presence.js

export default async function handler(req, res) {
  const { method } = req;

  const headers = {
    Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  if (method === 'POST') {
    const { id, emoji, score } = req.body;
    if (!id || !emoji) {
      return res.status(400).json({ error: 'Missing id or emoji' });
    }

    const payload = {
      emoji,
      score,
      lastPing: Date.now()
    };

    const result = await fetch(`${process.env.KV_REST_API_URL}/set/presence-${id}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const json = await result.json();
    return res.status(200).json({ success: true, result: json });
  }

  if (method === 'GET') {
    const result = await fetch(`${process.env.KV_REST_API_URL}/keys?prefix=presence-`, {
      headers
    });
    const keys = await result.json();

    const fetches = keys.result.map((key) =>
      fetch(`${process.env.KV_REST_API_URL}/get/${key}`, { headers }).then((res) => res.json())
    );

    const data = await Promise.all(fetches);
    const users = data.map((d) => d.result).filter(Boolean);
    return res.status(200).json(users);
  }

  res.status(405).end();
}




