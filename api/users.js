// api/users.js
// Log user terakhir yang masuk — Vercel + @vercel/kv

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, device, key1, key2 } = req.query;

  // ==========================================
  // MODE LOG — user kirim data saat buka
  // ==========================================
  if (action === 'log') {
    try {
      const ua = req.headers['user-agent'] || '';
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
              || req.headers['x-real-ip']
              || 'unknown';

      // Ambil semua log
      const rawLogs = await kv.lrange('user_logs', 0, -1) || [];
      let logs = [];
      for (const raw of rawLogs) {
        try {
          logs.push(typeof raw === 'string' ? JSON.parse(raw) : raw);
        } catch (e) {}
      }

      // Cek apakah IP sudah ada
      const existingIdx = logs.findIndex(l => l.ip === ip);

      if (existingIdx !== -1) {
        logs[existingIdx].time = new Date().toISOString();
        logs[existingIdx].device = device || 'unknown';
        logs[existingIdx].ua = ua.substring(0, 200);
        logs[existingIdx].visits = (logs[existingIdx].visits || 1) + 1;
      } else {
        logs.unshift({
          time: new Date().toISOString(),
          ip: ip,
          device: device || 'unknown',
          ua: ua.substring(0, 200),
          visits: 1
        });
      }

      // Batasi max 50
      logs = logs.slice(0, 50);

      // Simpan kembali
      await kv.del('user_logs');
      if (logs.length > 0) {
        await kv.lpush('user_logs', ...logs.map(l => JSON.stringify(l)));
        await kv.ltrim('user_logs', 0, 49);
      }

      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // ==========================================
  // MODE GET — admin minta daftar user
  // ==========================================
  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const rawLogs = await kv.lrange('user_logs', 0, 49) || [];
    const logs = [];
    for (const raw of rawLogs) {
      try {
        logs.push(typeof raw === 'string' ? JSON.parse(raw) : raw);
      } catch (e) {}
    }

    const uniqueIPs = new Set(logs.map(l => l.ip));
    const uniqueDevices = new Set(logs.map(l => l.device));

    return res.status(200).json({
      total: logs.length,
      uniqueIPs: uniqueIPs.size,
      uniqueDevices: uniqueDevices.size,
      logs: logs
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, logs: [] });
  }
}