// api/info.js
// Menyimpan dan mengambil data info aplikasi

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, title, content, contact, key1, key2 } = req.query;

  // 1. MODE AMBIL DATA (Untuk Admin Panel & Web Utama)
  if (!action) {
    try {
      const infoTitle = await kv.get('info_title') || 'Tentang Aplikasi';
      const infoContent = await kv.get('info_content') || 'Bypass Web — Bypass Generator Fast & Secure.';
      const infoContact = await kv.get('info_contact') || '';
      
      return res.status(200).json({ 
        title: infoTitle, 
        content: infoContent,
        contact: infoContact
      });
    } catch (err) {
      return res.status(200).json({ 
        title: 'Tentang Aplikasi', 
        content: 'Bypass Web.',
        contact: ''
      });
    }
  }

  // 2. MODE SIMPAN DATA
  if (action === 'set') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      await kv.set('info_title', title || 'Tentang Aplikasi');
      await kv.set('info_content', content || '');
      await kv.set('info_contact', contact || '');

      return res.status(200).json({ 
        success: true, 
        message: 'Info aplikasi berhasil disimpan' 
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Action tidak dikenal' });
}