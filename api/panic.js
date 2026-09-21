// api/panic.js
// Tombol panik — matikan semua + maintenance ON + broadcast

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

const ALL_SERVICES = ['adlink', 'sfl', 'delta', 'linkvertise', 'move2link', 'sub2unlock', 'sub4unlock', 'universal'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action, key1, key2 } = req.query;

  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // ==========================================
  // PANIC ON — Matikan semua + maintenance ON
  // ==========================================
  if (action === 'on') {
    // 1. Matikan semua service
    for (const s of ALL_SERVICES) {
      await kv.set(`service_${s}_status`, 'off');
      await kv.set(`service_${s}_reason`, 'Server down sementara — coba lagi nanti');
    }

    // 2. Aktifkan maintenance
    await kv.set('maintenance', 'on');

    // 3. Broadcast otomatis
    await kv.set('broadcast_message', '🚨 Server down sementara. Mohon tunggu beberapa saat.');
    await kv.set('broadcast_type', 'danger');
    await kv.set('broadcast_active', 'on');

    return res.status(200).json({
      success: true,
      message: 'PANIC MODE AKTIF — semua service OFF, maintenance ON, broadcast terkirim'
    });
  }

  // ==========================================
  // PANIC OFF — Nyalakan semua + maintenance OFF
  // ==========================================
  if (action === 'off') {
    for (const s of ALL_SERVICES) {
      await kv.set(`service_${s}_status`, 'on');
      await kv.set(`service_${s}_reason`, '');
    }

    await kv.set('maintenance', 'off');
    await kv.set('broadcast_active', 'off');

    return res.status(200).json({
      success: true,
      message: 'PANIC MODE NONAKTIF — semua service ON, maintenance OFF'
    });
  }

  return res.status(400).json({ error: 'Action harus on atau off' });
}
