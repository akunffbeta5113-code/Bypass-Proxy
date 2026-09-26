// api/contact.js
// Simpan kontak admin (WA + Telegram)

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, wa, telegram, key1, key2 } = req.query;

  // ==========================================
  // CEK KONTAK (publik)
  // ==========================================
  if (!action) {
    const wa = await kv.get('contact_wa') || '';
    const telegram = await kv.get('contact_telegram') || '';
    return res.status(200).json({
      wa: wa,
      telegram: telegram,
      active: !!(wa || telegram)
    });
  }

  // ==========================================
  // SET KONTAK (butuh 2 kunci)
  // ==========================================
  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await kv.set('contact_wa', wa || '');
    await kv.set('contact_telegram', telegram || '');
    return res.status(200).json({
      success: true,
      message: 'Kontak disimpan'
    });
  }

  // ==========================================
  // HAPUS KONTAK
  // ==========================================
  if (action === 'off') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await kv.set('contact_wa', '');
    await kv.set('contact_telegram', '');
    return res.status(200).json({
      success: true,
      message: 'Kontak dihapus'
    });
  }

  return res.status(400).json({ error: 'Action tidak dikenal' });
}
