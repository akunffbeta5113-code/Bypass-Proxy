const ALLOWED = {
  sfl: "https://api.theresav.eu/api/bypass/sfl",
  adlink: "https://api.theresav.eu/api/bypass/adlinksumo",
  bicolink: "https://api.theresav.eu/api/bypass/bicolink",
  linkvertise: "https://api.theresav.eu/api/bypass/linkvertise",
  delta: "https://api.theresav.eu/api/bypass/delta",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const type = String(req.query.type || "").toLowerCase();
  const input = String(req.query.url || "").trim();
  const target = ALLOWED[type];

  if (!target) return res.status(400).json({ error: "Unsupported type" });
  if (!input) return res.status(400).json({ error: "Missing url" });

  const key = process.env.THRESAV_API_KEY;
  if (!key) return res.status(500).json({ error: "THRESAV_API_KEY is not configured" });

  try {
    const targetUrl = target + "?url=" + encodeURIComponent(input);
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { "x-apikey": key }
    });

    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }

    return res.status(response.status).json(body);
  } catch (error) {
    return res.status(502).json({
      error: "Upstream request failed",
      message: error.message
    });
  }
}
