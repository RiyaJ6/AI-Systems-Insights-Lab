// netlify/functions/openai-proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt || '';
    const max_tokens = Math.min(256, Math.max(32, body.max_tokens || 128));
    const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;

    if(!process.env.OPENAI_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
    }

    const payload = {
      model: "text-davinci-003",
      prompt,
      max_tokens,
      temperature,
      echo: false,
      logprobs: 5,
      n: 1,
      best_of: 1
    };

    const res = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ provider: 'openai', raw: data })
    };
  } catch (err) {
    console.error('OpenAI proxy error', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
