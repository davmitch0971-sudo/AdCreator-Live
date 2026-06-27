// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---------- OpenRouter helper ----------
async function callOpenRouter(messages, extraSystem = '') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY in .env');
  }

  const body = {
    model: 'openrouter/auto',
    messages: [
      ...(extraSystem
        ? [{ role: 'system', content: extraSystem }]
        : []),
      ...messages,
    ],
    temperature: 0.7,
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://adcreator-live.local',
      'X-Title': 'AdCreator-Live',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error: ${res.status} - ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content from OpenRouter');
  return content;
}

// ---------- Basic health ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'AdCreator-Live backend' });
});

// ---------- Existing: single ad assistant ----------
app.post('/api/assistant', async (req, res) => {
  try {
    const {
      brandVoice,
      offer,
      platform,
      objective,
      imagePrompt,
      videoScript,
      shotList,
      critique,
      conversionStrategy,
    } = req.body;

    const userPrompt = `
You are an ad creative assistant.

Brand voice:
${brandVoice || 'Not provided'}

Offer:
${offer || 'Not provided'}

Platform:
${platform || 'Not specified'}

Objective:
${objective || 'Not specified'}

Image prompt:
${imagePrompt || 'None'}

Video script need:
${videoScript ? 'Yes' : 'No'}

Shot list need:
${shotList ? 'Yes' : 'No'}

Critique need:
${critique ? 'Yes' : 'No'}

Conversion strategy need:
${conversionStrategy ? 'Yes' : 'No'}

Generate a single ad concept with:
- Primary ad copy
- Hook
- CTA
- Optional image concept
- Optional video script outline
- Optional shot list
- Optional critique
- Optional conversion strategy

Return the result as clear, readable text (no JSON).
`;

    const content = await callOpenRouter([
      { role: 'user', content: userPrompt },
    ]);

    res.json({ success: true, result: content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- Existing: brand voice creation ----------
app.post('/api/brandvoice', async (req, res) => {
  try {
    const { brandDescription, examples } = req.body;

    const userPrompt = `
You are a brand voice architect.

Brand description:
${brandDescription || 'Not provided'}

Example copy:
${examples || 'None'}

Create a concise, reusable brand voice profile including:
- Tone
- Style
- Vocabulary
- Do's and Don'ts
- Example phrases

Return as readable text (no JSON).
`;

    const content = await callOpenRouter([
      { role: 'user', content: userPrompt },
    ]);

    res.json({ success: true, brandVoice: content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- Existing: brand voice rewrite ----------
app.post('/api/rewritebrandvoice', async (req, res) => {
  try {
    const { currentVoice, newDirection } = req.body;

    const userPrompt = `
You are a brand voice editor.

Current brand voice:
${currentVoice || 'Not provided'}

New direction / goals:
${newDirection || 'Not provided'}

Rewrite the brand voice to match the new direction while staying coherent and usable.

Return as readable text (no JSON).
`;

    const content = await callOpenRouter([
      { role: 'user', content: userPrompt },
    ]);

    res.json({ success: true, rewrittenVoice: content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- NEW: Predictive + Bulk + Scoring + ROI ----------
app.post('/api/predictive-ads', async (req, res) => {
  try {
    const {
      brandVoice,
      offer,
      platform,
      objective,
      budget,
      numVariations,
    } = req.body;

    const n = Math.min(Math.max(Number(numVariations) || 5, 1), 25);

    const systemPrompt = `
You are an advanced ad performance strategist.

You MUST respond ONLY with valid JSON in this exact structure:

{
  "ads": [
    {
      "id": "string",
      "copy": "string",
      "hook": "string",
      "cta": "string",
      "score": {
        "conversion_likelihood": 0-100,
        "click_through": 0-100,
        "engagement": 0-100
      },
      "roi": {
        "estimated_roas": "number",
        "estimated_cpa": "number",
        "notes": "string"
      },
      "reasoning": "string"
    }
  ],
  "summary": {
    "best_ad_id": "string",
    "overall_insight": "string",
    "recommendations": ["string"]
  }
}

No extra text. No commentary. No markdown. JSON ONLY.
`;

    const userPrompt = `
Brand voice:
${brandVoice || 'Not provided'}

Offer:
${offer || 'Not provided'}

Platform:
${platform || 'Not specified'}

Objective:
${objective || 'Not specified'}

Budget:
${budget || 'Not specified'}

Task:
Generate ${n} different ad variations for this brand and offer.
For each ad:
- Write copy, hook, CTA.
- Score conversion likelihood, click-through, engagement (0–100).
- Estimate ROAS and CPA based on the budget and typical platform behavior.
- Explain reasoning briefly.

Then:
- Pick the single best ad.
- Provide overall insight and recommendations.

Remember: JSON ONLY in the structure defined.
`;

    const raw = await callOpenRouter(
      [{ role: 'user', content: userPrompt }],
      systemPrompt
    );

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('JSON parse error from OpenRouter:', e, raw);
      return res.status(500).json({
        success: false,
        error: 'Model did not return valid JSON',
        raw,
      });
    }

    res.json({
      success: true,
      ads: parsed.ads || [],
      summary: parsed.summary || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`AdCreator-Live backend running on port ${PORT}`);
