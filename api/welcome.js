// api/welcome.js
// Pesan welcome + TikTok — edit langsung di sini

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // ==========================================
  // EDIT PESAN DI SINI
  // ==========================================
  const WELCOME_MESSAGE = `
Selamat datang di BYPASS WEB.
Jangan lupa follow TikTok kami ya! 🎵

Semoga harimu menyenangkan! 🔥`;

  const TIKTOK_URL = 'https://www.tiktok.com/@nuzz_rawrrr';
  const ACTIVE = true;  // ← ubah ke false kalau mau matikan
  // ==========================================

  return res.status(200).json({
    active: ACTIVE,
    message: WELCOME_MESSAGE,
    tiktok_url: TIKTOK_URL
  });
}
