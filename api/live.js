// api/live.js
// Live user + counter bypass global

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, session } = req.query;

  if (action === 'ping') {
    if (session) {
      try {
        await kv.hset('live_sessions', { [session]: Date.now() });
      } catch (e) {}
    }
    return res.status(200).json({ success: true });
  }

  const now = Date.now();
  const timeout = 60 * 1000;

  let liveCount = 1;
  try {
    const sessions = await kv.hgetall('live_sessions') || {};
    let active = 0;
    for (const key in sessions) {
      if (now - parseInt(sessions[key]) < timeout) active++;
    }
    liveCount = Math.max(active, 1);
  } catch (err) {}

  const today = new Date().toISOString().split('T')[0];
  let todayCount = 0, totalCount = 0;
  try {
    todayCount = parseInt(await kv.get(`stats_bypass_${today}`)) || 0;
    totalCount = parseInt(await kv.get('stats_total_bypass')) || 0;
  } catch (err) {}

  return res.status(200).json({
    live: liveCount,
    today: todayCount,
    total: totalCount,
    timestamp: new Date().toISOString()
  });
}
