export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (req.method === 'POST') {
    const { id, emoji, score } = req.body;

    const data = {
      emoji,
      score,
      lastPing: Date.now()
    };

    const save = await fetch(`${url}/set/presence-${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await save.json();
    return res.status(200).json({ success: true, result });
  }

  // GET active users
  const keysRes = await fetch(`${url}/keys?prefix=presence-`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const keys = await keysRes.json();
  const now = Date.now();
  const fetches = keys.result.map((key) =>
    fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json())
  );

  const values = await Promise.all(fetches);
  const users = values.map(v => v.result).filter(Boolean);
  res.status(200).json(users);
}

