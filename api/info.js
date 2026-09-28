// api/info.js
// Info aplikasi — bisa diubah dari admin panel

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, title, content, contact, key1, key2 } = req.query;

  if (!action) {
    const title = await kv.get('info_title') || 'Tentang Aplikasi';
    const content = await kv.get('info_content') || 'Bypass Web\n\nVersi 1.0.0\n\nBypass Generator Fast & Secure.\n\n© SECRETDEV';
    const contact = await kv.get('info_contact') || '';
    return res.status(200).json({ title, content, contact });
  }

  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await kv.set('info_title', title || 'Tentang Aplikasi');
    await kv.set('info_content', content || '');
    await kv.set('info_contact', contact || '');
    return res.status(200).json({ success: true, message: 'Info disimpan' });
  }

  return res.status(400).json({ error: 'Action tidak dikenal' });
}
