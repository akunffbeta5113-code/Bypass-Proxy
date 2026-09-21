import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

const ENDPOINTS = {
  adlink: 'adlink',
  sfl: 'sfl',
  delta: 'izen',
  linkvertise: 'linkvertise',
  move2link: 'move2link',
  sub2unlock: 'sub2unlock',
  sub4unlock: 'sub4unlock',
  universal: 'universal'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-apikey, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { type, url } = req.query;

  if (!type || !url) {
    return res.status(400).json({ error: 'Parameter type dan url wajib diisi' });
  }

  if (!ENDPOINTS[type]) {
    return res.status(400).json({ error: 'Unsupported type: ' + type });
  }

  const target = `https://api.theresav.eu/api/bypass/${ENDPOINTS[type]}?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: { 'x-apikey': 'SQ7Dw' }
    });

    const data = await response.text();

    // ==========================================
    // CATAT STATISTIK
    // ==========================================
    try {
      const dataJson = JSON.parse(data);
      if (dataJson && dataJson.status === true) {
        const today = new Date().toISOString().split('T')[0];
        await kv.incr(`stats_bypass_${today}`);
        await kv.incr(`stats_service_${type}_${today}`);
        await kv.incr(`stats_total_bypass`);
        await kv.incr(`stats_total_service_${type}`);
        const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
        if (ip) await kv.sadd(`stats_users_${today}`, ip);
      }
    } catch (logErr) {
      console.error('Log error:', logErr);
    }

    return res.status(response.status)
      .setHeader('Content-Type', 'application/json')
      .send(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
          }
