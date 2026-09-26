import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw { statusCode: 503, message: 'AI service is not configured' };
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro'
];

async function callGeminiWithFallback(fn) {
  const client = getClient();
  let lastError = null;

  for (const modelName of DEFAULT_MODELS) {
    try {
      return await fn(client, modelName);
    } catch (error) {
      lastError = error;
      console.warn(`[Gemini AI Warning] Model '${modelName}' failed: ${error?.message || error}. Trying fallback model...`);
    }
  }

  console.error('[Gemini AI Error] All Gemini models failed. Last error:', lastError?.message || lastError);
  throw { statusCode: 503, message: 'AI service is temporarily unavailable. Please try again.' };
}

export async function generateText(systemPrompt, userMessage) {
  try {
    return await callGeminiWithFallback(async (client, modelName) => {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt
      });
      const result = await model.generateContent(userMessage);
      return result.response.text();
    });
  } catch (error) {
    if (error.statusCode) throw error;
    throw { statusCode: 503, message: 'AI service is temporarily unavailable. Please try again.' };
  }
}

export async function generateJSON(systemPrompt, userMessage) {
  try {
    const text = await callGeminiWithFallback(async (client, modelName) => {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(userMessage);
      return result.response.text();
    });

    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw { statusCode: 502, message: 'AI returned an invalid response. Please try again.' };
    }
  } catch (error) {
    if (error.statusCode) throw error;
    throw { statusCode: 503, message: 'AI service is temporarily unavailable. Please try again.' };
  }
}

export async function analyzeImage(systemPrompt, imageBase64, mimeType, context = '') {
  try {
    const text = await callGeminiWithFallback(async (client, modelName) => {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent([
        { text: context || 'Analyze this image.' },
        { inlineData: { data: imageBase64, mimeType } }
      ]);
      return result.response.text();
    });

    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw { statusCode: 502, message: 'AI returned an invalid response. Please try again.' };
    }
  } catch (error) {
    if (error.statusCode) throw error;
    throw { statusCode: 503, message: 'AI service is temporarily unavailable. Please try again.' };
  }
}