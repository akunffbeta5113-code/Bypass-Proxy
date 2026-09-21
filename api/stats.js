// api/stats.js
// Baca statistik untuk dashboard

import { kv } from '@vercel/kv';

const ADMIN_KEY_1 = '5113';
const ADMIN_KEY_2 = '25413';

const SERVICES = ['adlink', 'sfl', 'delta', 'linkvertise', 'move2link', 'sub2unlock', 'sub4unlock', 'universal'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { key1, key2 } = req.query;

  if (key1 !== ADMIN_KEY_1 || key2 !== ADMIN_KEY_2) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // ==========================================
  // TOTAL HARI INI
  // ==========================================
  const todayTotal = await kv.get(`stats_bypass_${today}`) || 0;
  const todayUsers = await kv.scard(`stats_users_${today}`) || 0;

  // Per service hari ini
  const todayByService = {};
  for (const s of SERVICES) {
    todayByService[s] = await kv.get(`stats_service_${s}_${today}`) || 0;
  }

  // ==========================================
  // 7 HARI TERAKHIR
  // ==========================================
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = await kv.get(`stats_bypass_${dateStr}`) || 0;
    const users = await kv.scard(`stats_users_${dateStr}`) || 0;
    last7.push({ date: dateStr, count: parseInt(count), users: parseInt(users) });
  }

  // ==========================================
  // TOTAL KESELURUHAN
  // ==========================================
  const totalAll = await kv.get('stats_total_bypass') || 0;

  const totalByService = {};
  for (const s of SERVICES) {
    totalByService[s] = await kv.get(`stats_total_service_${s}`) || 0;
  }

  // ==========================================
  // SERVICE TERPOPULER
  // ==========================================
  let topService = '-';
  let topCount = 0;
  for (const s of SERVICES) {
    const c = parseInt(totalByService[s]) || 0;
    if (c > topCount) { topCount = c; topService = s; }
  }

  return res.status(200).json({
    today: {
      total: parseInt(todayTotal),
      users: parseInt(todayUsers),
      byService: todayByService
    },
    last7Days: last7,
    allTime: {
      total: parseInt(totalAll),
      byService: totalByService,
      topService: topService,
      topCount: topCount
    }
  });
}
