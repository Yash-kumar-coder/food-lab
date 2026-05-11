const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
// Increase payload limit for base64 images
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini API client
// The GoogleGenAI client automatically picks up process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

// Route to analyze ingredients
app.post('/api/analyze', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are a toxicologist. Read the ingredients from this image and analyze their health impact. Return ONLY a valid JSON object (no markdown, no backticks). Schema: { "dangerScore": Number (0-100), "verdict": String, "harmfulIngredients": [ { "name": String, "reason": String } ], "safeIngredients": [ String ] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg', // Defaulting to jpeg, but gemini handles various image formats
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text;
    console.log('Gemini raw response:', resultText);

    // Clean the response just in case the AI wraps it in markdown blocks
    const cleanedResult = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(cleanedResult);

    res.json(parsedData);

  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // If the API key is leaked/invalid, return a mock response so the UI can still be previewed
    if (error.status === 403 || error.message?.includes('API key')) {
      console.log('Returning mock data since the API key is invalid or leaked.');
      return res.json({
        dangerScore: 65,
        verdict: "Mock Analysis: This is a simulated result because your Gemini API key is currently disabled.",
        harmfulIngredients: [
          { name: "Simulated Harmful Ingredient", reason: "This is a placeholder for a harmful ingredient." }
        ],
        safeIngredients: ["Simulated Safe Ingredient 1", "Simulated Safe Ingredient 2"]
      });
    }

    res.status(500).json({ error: 'Failed to analyze image. Ensure API key is set and image is valid.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY is not set in the environment variables.');
  }
});
