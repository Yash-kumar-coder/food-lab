require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'hello' }] }]
    });
    console.log('Success:', response.text);
  } catch (e) {
    console.error('Error testing 2.5:', e.message);
  }
}

test();
