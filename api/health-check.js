// api/health-check.js
// Endpoint untuk cron-job.org

export default async function handler(req, res) {
  try {
    const baseUrl = 'https://' + (req.headers.host || 'bypass-proxy.vercel.app');
    const response = await fetch(baseUrl + '/api/health?auto=1');
    const data = await response.json();
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
