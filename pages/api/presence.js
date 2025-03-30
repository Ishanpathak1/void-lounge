import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const now = Date.now();

  if (req.method === 'PUT') {
    const { id, emoji, score } = req.body;
    if (!id || !emoji) return res.status(400).json({ error: 'Missing fields' });

    await kv.hset(`presence:${id}`, {
      emoji,
      score,
      lastPing: now,
    });

    await kv.expire(`presence:${id}`, 15); // auto-expire in 15 seconds

    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const keys = await kv.keys('presence:*');
    const users = [];

    for (const key of keys) {
      const data = await kv.hgetall(key);
      if (!data || !data.lastPing) continue;

      const age = now - parseInt(data.lastPing);
      if (age <= 10000) {
        users.push({
          emoji: data.emoji,
          score: parseInt(data.score || 0),
          lastPing: parseInt(data.lastPing),
        });
      }
    }

    users.sort((a, b) => b.score - a.score);
    return res.status(200).json({ users });
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
