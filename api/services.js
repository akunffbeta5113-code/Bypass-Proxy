// api/services.js
// ON/OFF per service + alasan

import { kv } from '@vercel/kv';

// ==========================================
// KUNCI ADMIN — GANTI kalau perlu
// ==========================================
const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

const VALID_SERVICES = ['adlink', 'sfl', 'delta', 'linkvertise', 'move2link', 'universal'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, service, status, reason, key1, key2 } = req.query;

  // ==========================================
  // CEK SEMUA SERVICE (publik)
  // ==========================================
  if (!action) {
    const result = {};
    for (const s of VALID_SERVICES) {
      const st = await kv.get(`service_${s}_status`) || 'on';
      const rs = await kv.get(`service_${s}_reason`) || '';
      result[s] = { status: st, reason: rs };
    }
    return res.status(200).json({ services: result });
  }

  // ==========================================
  // UBAH STATUS SERVICE (butuh 2 kunci)
  // ==========================================
  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!VALID_SERVICES.includes(service)) {
      return res.status(400).json({ error: 'Service tidak valid' });
    }
    if (status !== 'on' && status !== 'off') {
      return res.status(400).json({ error: 'Status harus on atau off' });
    }

    await kv.set(`service_${service}_status`, status);
    await kv.set(`service_${service}_reason`, reason || '');
    await kv.set(`service_${service}_updated_at`, new Date().toISOString());

    return res.status(200).json({
      success: true,
      service,
      status,
      reason: reason || '',
      message: `Service ${service} -> ${status.toUpperCase()}`
    });
  }

  return res.status(400).json({ error: 'Action tidak dikenal' });
}
