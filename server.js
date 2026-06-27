// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// API Endpoint for AI Ad Creation
app.post('/api/assistant', async (req, res) => {
  const { prompt, model } = req.body; 

  // Verify API Key exists
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "OpenRouter API Key not configured on the backend." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080", // Required by OpenRouter for ranking
        "X-Title": "AdCreator-AI",              // Required by OpenRouter for ranking
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "openai/gpt-4o", // Default model fallback
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error("OpenRouter connection error:", error);
    res.status(500).json({ error: "Failed to connect to OpenRouter engine." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`AdCreator-AI backend running and listening on port ${PORT}`);
});

