const ALLOWED = {
  sfl: {
    url: "https://api.theresav.eu/api/bypass/sfl",
    needsKey: true,
  },
  adlink: {
    url: "https://api.theresav.eu/api/bypass/adlinksumo",
    needsKey: true,
  },
  demon: {
    url: "https://demonbypass.vercel.app/api/bypass",
    needsKey: false,
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const type = String(req.query.type || "").toLowerCase();
  const input = String(req.query.url || "").trim();
  const target = ALLOWED[type];

  if (!target) {
    return res.status(400).json({ error: "Unsupported type" });
  }

  if (!input) {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    // Keep the original URL as a query parameter; URLSearchParams handles encoding.
    const targetUrl =
      target.url + "?url=" + encodeURIComponent(input);

    const headers = {};
    if (target.needsKey) {
      const key = process.env.THRESAV_API_KEY;
      if (!key) {
        return res.status(500).json({
          error: "THRESAV_API_KEY is not configured on the server"
        });
      }
      headers["x-apikey"] = key;
    }

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    return res.status(response.status).json(
      typeof body === "string" ? { raw: body } : body
    );
  } catch (error) {
    return res.status(502).json({
      error: "Upstream request failed",
      message: error.message
    });
  }
}
  
