require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function callOpenRouter(messages, extraSystem = '') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const body = {
    model: 'openrouter/auto',
    messages: [...(extraSystem ? [{ role: 'system', content: extraSystem }] : []), ...messages],
    temperature: 0.7,
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://adcreator-live.onrender.com',
      'X-Title': 'AdCreator-Live',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

app.post('/api/assistant', async (req, res) => {
  try {
    const { brandVoice, offer, platform, objective, imagePrompt, videoScript, shotList, critique, conversionStrategy } = req.body;
    const content = await callOpenRouter([{ role: 'user', content: `Generate ad for: ${brandVoice}, ${offer}` }]);
    res.json({ success: true, result: content });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/brandvoice', async (req, res) => {
  try {
    const { brandDescription, examples } = req.body;
    const content = await callOpenRouter([{ role: 'user', content: `Create voice for: ${brandDescription}` }]);
    res.json({ success: true, brandVoice: content });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/rewritebrandvoice', async (req, res) => {
  try {
    const { currentVoice, newDirection } = req.body;
    const content = await callOpenRouter([{ role: 'user', content: `Rewrite voice: ${currentVoice} to ${newDirection}` }]);
    res.json({ success: true, rewrittenVoice: content });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/predictive-ads', async (req, res) => {
  try {
    const { brandVoice, offer, platform, objective, budget, numVariations } = req.body;
    const n = Math.min(Math.max(Number(numVariations) || 5, 1), 25);
    const systemPrompt = 'You are an ad strategist. Respond ONLY with valid JSON structure: {"ads": [], "summary": {}}';
    const userPrompt = `Generate ${n} variations for ${brandVoice} offering ${offer}. JSON ONLY.`;
    
    const raw = await callOpenRouter([{ role: 'user', content: userPrompt }], systemPrompt);
    const parsed = JSON.parse(raw.replace(/```json|```/g, ''));
    res.json({ success: true, ads: parsed.ads || [], summary: parsed.summary || {} });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));

