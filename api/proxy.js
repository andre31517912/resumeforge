export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic rate limiting header check (optional but good practice)
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://resumeforge.vercel.app',
    'http://localhost:3000',
    'http://localhost:5500',
  ];
  // In production, enforce origin — comment out during local dev if needed
  // if (!allowedOrigins.some(o => origin.startsWith(o))) {
  //   return res.status(403).json({ error: 'Forbidden' });
  // }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Forward the exact status code from Anthropic
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Proxy request failed', detail: err.message });
  }
}
