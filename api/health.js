// api/health.js
// Health check semua server

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { key1, key2 } = req.query;

  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const results = {
    vercel: { status: 'checking', time: null, message: '' },
    upstash: { status: 'checking', time: null, message: '' },
    theresav: { status: 'checking', time: null, message: '' }
  };

  // ==========================================
  // 1. CEK VERCEL (server ini sendiri)
  // ==========================================
  const vercelStart = Date.now();
  results.vercel.status = 'online';
  results.vercel.time = Date.now() - vercelStart;
  results.vercel.message = 'API Vercel berjalan normal';

  // ==========================================
  // 2. CEK UPSTASH KV
  // ==========================================
  const kvStart = Date.now();
  try {
    await kv.set('health_check', Date.now().toString());
    const val = await kv.get('health_check');
    results.upstash.status = val ? 'online' : 'warning';
    results.upstash.time = Date.now() - kvStart;
    results.upstash.message = val ? 'Upstash KV berjalan normal' : 'KV tidak merespons dengan benar';
  } catch (err) {
    results.upstash.status = 'offline';
    results.upstash.time = Date.now() - kvStart;
    results.upstash.message = 'Error: ' + err.message;
  }

  // ==========================================
  // 3. CEK THERESAV API
  // ==========================================
  const theresavStart = Date.now();
  try {
    const response = await fetch('https://api.theresav.eu/api/bypass/move2link?url=https://move2link.co/b4264b4', {
      method: 'GET',
      headers: { 'x-apikey': 'SQ7Dw' }
    });

    const elapsed = Date.now() - theresavStart;

    if (response.ok) {
      const data = await response.json();
      if (data.status === true) {
        results.theresav.status = 'online';
        results.theresav.message = 'Theresav API berjalan normal';
      } else {
        results.theresav.status = 'warning';
        results.theresav.message = 'Theresav API merespons tapi data tidak valid';
      }
    } else {
      results.theresav.status = 'warning';
      results.theresav.message = 'Theresav API merespons HTTP ' + response.status;
    }
    results.theresav.time = elapsed;
  } catch (err) {
    results.theresav.status = 'offline';
    results.theresav.time = Date.now() - theresavStart;
    results.theresav.message = 'Error: ' + err.message;
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    results: results
  });
}
