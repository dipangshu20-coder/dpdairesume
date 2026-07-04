// Vercel Serverless Function — Gemini AI Proxy
// File location: api/gemini.js (at repo root)
// Set GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) { res.status(500).json({ error: 'GEMINI_API_KEY not set in Vercel environment variables' }); return; }

  try {
    const body = req.body;
    if (!body || !body.contents) { res.status(400).json({ error: 'Invalid request body' }); return; }

    // FIXED: correct model name + correct API version
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message || 'Gemini API error' });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Gemini proxy error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
