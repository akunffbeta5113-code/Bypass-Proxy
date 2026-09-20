// api/maintenance.js
// Sistem maintenance mode dengan 2 kunci rahasia
// Hanya admin (Yang Mulia) yang bisa ON/OFF

import { kv } from '@vercel/kv';

// ==========================================
// KUNCI RAHASIA — GANTI dengan milik Yang Mulia!
// JANGAN kasih tahu siapapun
// ==========================================
const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { action, key1, key2 } = req.query;

  // ==========================================
  // MODE 1: Cek status (dipanggil oleh HTML utama)
  // Tidak butuh key — publik hanya bisa lihat ON/OFF
  // ==========================================
  if (!action) {
    try {
      const maintenance = (await kv.get('maintenance')) === 'on';
      return res.status(200).json({
        maintenance: maintenance,
        updatedAt: await kv.get('maintenance_updated_at') || null
      });
    } catch (err) {
      // Kalau KV belum siap, default OFF
      return res.status(200).json({ maintenance: false });
    }
  }

  // ==========================================
  // MODE 2: Ubah status — WAJIB 2 KUNCI BENAR
  // ==========================================
  if (action === 'on' || action === 'off') {
    // Cek dua kunci
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Kunci tidak valid'
      });
    }

    try {
      await kv.set('maintenance', action);
      await kv.set('maintenance_updated_at', new Date().toISOString());

      return res.status(200).json({
        success: true,
        maintenance: action === 'on',
        message: action === 'on'
          ? 'Maintenance AKTIF di semua device'
          : 'Maintenance NONAKTIF'
      });
    } catch (err) {
      return res.status(500).json({
        error: 'KV error',
        message: err.message
      });
    }
  }

  return res.status(400).json({ error: 'Action tidak dikenal' });
        }
