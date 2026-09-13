// api/bypass.js
export default async function handler(req, res) {
  // Header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-apikey, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { type, url } = req.query;

  if (!type || !url) {
    return res.status(400).json({ error: 'Parameter type dan url wajib diisi' });
  }

  // Daftar tipe yang didukung — SUDAH DITAMBAH move2link
  const ENDPOINTS = {
    adlink: 'adlink',
    sfl: 'sfl',
    delta: 'izen',
    linkvertise: 'linkvertise',
    move2link: 'move2link',   // ← INI DIA
    universal: 'universal'
  };

  if (!ENDPOINTS[type]) {
    return res.status(400).json({ error: 'Unsupported type: ' + type });
  }

  const endpoint = ENDPOINTS[type];
  const target = `https://api.theresav.eu/api/bypass/${endpoint}?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: {
        'x-apikey': 'SQ7Dw'
      }
    });

    const data = await response.text();
    res.status(response.status).setHeader('Content-Type', 'application/json').send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
