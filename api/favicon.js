// api/favicon.js
// Custom favicon — simpan URL gambar

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, url, key1, key2 } = req.query;

  // ==========================================
  // CEK FAVICON (publik)
  // ==========================================
  if (!action) {
    const url = await kv.get('custom_favicon') || '';
    return res.status(200).json({
      active: url ? true : false,
      url: url
    });
  }

  // ==========================================
  // SET FAVICON (butuh 2 kunci)
  // ==========================================
  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!url) {
      return res.status(400).json({ error: 'URL gambar wajib diisi' });
    }
    await kv.set('custom_favicon', url);
    return res.status(200).json({
      success: true,
      message: 'Favicon disimpan'
    });
  }

  // ==========================================
  // HAPUS FAVICON
  // ==========================================
  if (action === 'off') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await kv.set('custom_favicon', '');
    return res.status(200).json({
      success: true,
      message: 'Favicon dihapus'
    });
  }

  return res.status(400).json({ error: 'Action tidak dikenal' });
}
