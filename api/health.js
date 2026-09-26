// api/health.js
// Health check + auto-maintenance — HEMAT KV

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

// ==========================================
// CEK SEMUA SERVER
// ==========================================
async function cekSemuaServer() {
  const results = {
    vercel: { status: 'online', time: 1, message: 'Vercel API berjalan normal' },
    upstash: { status: 'checking', time: 0, message: '' },
    theresav: { status: 'checking', time: 0, message: '' }
  };

  // 1. Cek Upstash — pakai GET saja (hemat)
  const kvStart = Date.now();
  try {
    const val = await kv.get('health_heartbeat');
    results.upstash.status = 'online';
    results.upstash.time = Date.now() - kvStart;
    results.upstash.message = 'Upstash KV berjalan normal';
  } catch (err) {
    results.upstash.status = 'offline';
    results.upstash.time = Date.now() - kvStart;
    results.upstash.message = 'Error: ' + err.message;
  }

  // 2. Cek Theresav
  const tStart = Date.now();
  try {
    const response = await fetch('https://api.theresav.eu/api/bypass/move2link?url=https://move2link.co/b4264b4', {
      method: 'GET',
      headers: { 'x-apikey': 'SQ7Dw' }
    });
    const elapsed = Date.now() - tStart;

    if (response.ok) {
      const data = await response.json();
      if (data.status === true) {
        results.theresav.status = 'online';
        results.theresav.message = 'Theresav API berjalan normal';
      } else {
        results.theresav.status = 'warning';
        results.theresav.message = 'Theresav respons tidak valid';
      }
    } else {
      results.theresav.status = 'warning';
      results.theresav.message = 'Theresav HTTP ' + response.status;
    }
    results.theresav.time = elapsed;
  } catch (err) {
    results.theresav.status = 'offline';
    results.theresav.time = Date.now() - tStart;
    results.theresav.message = 'Error: ' + err.message;
  }

  return results;
}

// ==========================================
// AUTO-MAINTENANCE — HEMAT KV
// ==========================================
async function autoMaintenanceCheck() {
  const results = await cekSemuaServer();

  const adaOffline = Object.values(results).some(s => s.status === 'offline');
  const semuaNormal = Object.values(results).every(s => s.status === 'online');

  // Baca status terakhir (1 perintah)
  let state = {};
  try {
    state = await kv.get('health_state') || {};
  } catch (e) {
    state = {};
  }

  const maintenanceSekarang = state.maintenance === true;
  const autoActive = state.auto_active === true;

  let aksi = 'tidak ada';
  let needSave = false;

  // Kalau ada server offline & maintenance belum ON
  if (adaOffline && !maintenanceSekarang) {
    await kv.set('maintenance', 'on');
    await kv.set('auto_maintenance_active', 'on');
    await kv.set('broadcast_message', '⚠️ Server bermasalah. Maintenance otomatis aktif.');
    await kv.set('broadcast_type', 'warning');
    await kv.set('broadcast_active', 'on');
    aksi = 'maintenance ON (auto)';
    state.maintenance = true;
    state.auto_active = true;
    needSave = true;
  }
  // Kalau semua normal & auto-maintenance aktif
  else if (semuaNormal && autoActive) {
    await kv.set('maintenance', 'off');
    await kv.set('auto_maintenance_active', 'off');
    await kv.set('broadcast_active', 'off');
    aksi = 'maintenance OFF (auto)';
    state.maintenance = false;
    state.auto_active = false;
    needSave = true;
  }

  // Simpan state — 1 perintah (hanya kalau berubah)
  if (needSave) {
    state.updated_at = new Date().toISOString();
    await kv.set('health_state', state);
  }

  return { results, aksi };
}

// ==========================================
// HANDLER
// ==========================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { key1, key2, auto } = req.query;

  // ==========================================
  // MODE AUTO (dipanggil cron-job.org)
  // ==========================================
  if (auto === '1') {
    try {
      const { results, aksi } = await autoMaintenanceCheck();
      return res.status(200).json({
        timestamp: new Date().toISOString(),
        auto: true,
        aksi: aksi,
        results: results
      });
    } catch (err) {
      return res.status(500).json({ auto: true, error: err.message });
    }
  }

  // ==========================================
  // MODE MANUAL (dari admin panel)
  // ==========================================
  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const results = await cekSemuaServer();
  return res.status(200).json({
    timestamp: new Date().toISOString(),
    auto: false,
    results: results
  });
      }
