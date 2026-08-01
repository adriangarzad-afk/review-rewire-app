// Backend endpoint — runs on Vercel, never in the client's browser.
// Holds your Anthropic API key safely and forwards the conversation to Claude.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { system, messages } = req.body;

    if (!system || !messages) {
      res.status(400).json({ error: 'Missing system or messages' });
      return;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
