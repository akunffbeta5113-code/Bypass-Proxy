// api/maintenance.js
// Sistem maintenance + mode admin view

import { kv } from '@vercel/kv';

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

  const { action, key1, key2, adminView } = req.query;

  // ==========================================
  // MODE ADMIN VIEW
  // Dipanggil oleh index.html kalau ada token di URL
  // Balas: maintenance false (walau aslinya true)
  // ==========================================
  if (adminView === '1') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({ error: 'Forbidden', isAdmin: false });
    }
    return res.status(200).json({
      maintenance: false,   // paksa false
      isAdmin: true
    });
  }

  // ==========================================
  // CEK STATUS (publik — dipakai oleh index.html biasa)
  // ==========================================
  if (!action) {
    const maintenance = (await kv.get('maintenance')) === 'on';
    return res.status(200).json({ maintenance });
  }

  // ==========================================
  // UBAH STATUS — wajib 2 kunci benar
  // ==========================================
  if (action === 'on' || action === 'off') {
    if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Kunci tidak valid'
      });
    }
    await kv.set('maintenance', action);
    return res.status(200).json({
      success: true,
      maintenance: action === 'on',
      message: action === 'on' ? 'Maintenance AKTIF di semua device' : 'Maintenance NONAKTIF'
    });
  }

  return res.status(400).json({ error: 'Action tidak dikenal' });
}
