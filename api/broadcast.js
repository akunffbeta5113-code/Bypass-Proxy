// api/broadcast.js
// Notifikasi broadcast ke semua user

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, message, type, key1, key2 } = req.query;

  // ==========================================
  // CEK BROADCAST (publik)
  // GET /api/broadcast
  // ==========================================
  if (!action) {
    const message = await kv.get('broadcast_message') || '';
    const type = await kv.get('broadcast_type') || 'info';
    const active = await kv.get('broadcast_active') || 'off';

    return res.status(200).json({
      active: active === 'on',
      message: message,
      type: type
    });
  }

  // ==========================================
  // SET BROADCAST (butuh 2 kunci)
  // GET /api/broadcast?action=set&message=...&type=info&key1=...&key2=...
  // ==========================================
  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await kv.set('broadcast_message', message || '');
    await kv.set('broadcast_type', type || 'info');
    await kv.set('broadcast_active', 'on');
    await kv.set('broadcast_updated_at', new Date().toISOString());

    return res.status(200).json({
      success: true,
      message: 'Broadcast terkirim ke semua user'
    });
  }

  // ==========================================
  // MATIKAN BROADCAST
  // GET /api/broadcast?action=off&key1=...&key2=...
  // ==========================================
  if (action === 'off') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await kv.set('broadcast_active', 'off');
    return res.status(200).json({
      success: true,
      message: 'Broadcast dimatikan'
    });
  }

  return res.status(400).json({ error: 'Action tidak dikenal' });
                 }
