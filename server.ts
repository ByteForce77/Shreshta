import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI with GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize model selection based on prompt requirements
function resolveModel(requestedModel?: string, enableMaps?: boolean): string {
  if (enableMaps) {
    // Specification: "You MUST add Maps Grounding to the app where relevant to get up to date and accurate information. Use gemini-3.5-flash (with googleMaps tool)"
    return 'gemini-3.5-flash';
  }

  if (requestedModel === 'gemini-3.1-pro-preview' || requestedModel === 'complex') {
    return 'gemini-3.1-pro-preview';
  }

  if (requestedModel === 'gemini-3.1-flash-lite' || requestedModel === 'fast') {
    return 'gemini-3.1-flash-lite';
  }

  // General tasks default to gemini-3.5-flash
  return 'gemini-3.5-flash';
}

// System Instruction defining the Shreshta Concierge Role
const SYSTEM_INSTRUCTION = `You are the official AI Agro & Nutrition Concierge for POLUMATI'S SHRESHTA™ Cold Pressed Oils & Agro Foods.
Your brand tagline is "Born to Add Value".
Theme: Premium • Clean • Traditional • Trustworthy.

Your Knowledge Base:
1. Vaagai Wood Chekku Cold Pressed Oils:
   - Wood-Pressed Groundnut Oil: Extracted under 35°C on Vaagai wood expellers. Rich in Vitamin E, resveratrol, high smoke point for daily Indian curries & frying.
   - Bellam Sesame (Til) Oil: Cold-pressed native sesame seeds blended with palm jaggery (bellam). Legendary aroma, Tridosha-balancing, rich in Sesamol, Sesamolin & Calcium.
   - Extra Virgin Coconut Oil: Copra pressed, crystal clear, edible and hair care, rich in Lauric acid.
   - Pancha Deepam Pooja Oil: 5 sacred oils (Sesame, Mahua, Castor, Neem, Cow Ghee) for positive aura and clean burning mandir lamps.
2. Monthly Family Essentials & Navaratnalu:
   - 10+ KG sacred heirloom grain kit: Toor dal (కందులు), Moong dal (పెసలు), Black Urad (మినుములు), Chana (శనగలు), Sesame (నువ్వులు), Bansi Wheat (గోధుమలు), Hand-pounded Rice (వరి), Horsegram (ఉలువలు), Cowpeas (బొబ్బర్లు).
   - Plus configurable 5 Litre cold-pressed oil combinations.
3. Health, Ayurvedic & Culinary Guidance:
   - Explain why unrefined oils contain natural antioxidants and zero hexane solvents compared to commercial refined oils.
   - Offer storage instructions (cool pantry, best within 6-9 months).
4. Store & Delivery Locator:
   - When users ask about store locations, markets, or availability in their city (e.g., Bhimavaram, Vijayawada, Hyderabad, Visakhapatnam, Rajahmundry, Guntur, Bangalore), use Maps data to provide accurate store information.

Tone: Warm, respectful, traditional, well-structured with clear bullet points. Mention Telugu names where appropriate.`;

// 1. Multi-turn Chat Endpoint with Gemini models and optional Google Maps Grounding
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages = [],
      model: clientModel,
      enableMaps = false,
      userLocation,
      customSystemInstruction,
    } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const selectedModel = resolveModel(clientModel, enableMaps);
    const systemInstruction = customSystemInstruction || SYSTEM_INSTRUCTION;

    // Convert messages to GenAI contents format
    // Format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const config: any = {
      systemInstruction,
    };

    // If Maps Grounding is requested or relevant to query
    if (enableMaps) {
      config.tools = [{ googleMaps: {} }];
      if (userLocation?.latitude && userLocation?.longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(userLocation.latitude),
              longitude: Number(userLocation.longitude),
            },
          },
        };
      }
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract any Google Maps links and references
    const mapPlaces: { title?: string; uri?: string }[] = [];
    if (groundingChunks && Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.maps?.uri) {
          mapPlaces.push({
            title: chunk.maps.title || 'View on Google Maps',
            uri: chunk.maps.uri,
          });
        }
      });
    }

    return res.json({
      text,
      modelUsed: selectedModel,
      groundingChunks,
      mapPlaces,
    });
  } catch (error: any) {
    console.error('Gemini API Error in /api/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response from Gemini API',
    });
  }
});

// 2. Dedicated Google Maps Grounding Endpoint: Locate Organic Stores & Cold-Press Outlets
app.post('/api/find-stores', async (req, res) => {
  try {
    const { query: searchQuery = 'organic cold pressed oil stores and farmers markets', city = 'Bhimavaram', userLocation } = req.body;

    const prompt = `Find nearby verified organic food stores, traditional cold pressed oil chekku mills, or agricultural markets in or around ${city}. Provide exact names, locations, and what customers can expect. User search query: "${searchQuery}".`;

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (userLocation?.latitude && userLocation?.longitude) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(userLocation.latitude),
            longitude: Number(userLocation.longitude),
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config,
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const mapPlaces: { title?: string; uri?: string }[] = [];
    if (groundingChunks && Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.maps?.uri) {
          mapPlaces.push({
            title: chunk.maps.title || 'View Location',
            uri: chunk.maps.uri,
          });
        }
      });
    }

    return res.json({
      text,
      mapPlaces,
      groundingChunks,
      modelUsed: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    console.error('Maps Grounding Error in /api/find-stores:', error);
    return res.status(500).json({
      error: error.message || 'Failed to query Google Maps data via Gemini',
    });
  }
});

// Vite Middleware for Fullstack Development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
