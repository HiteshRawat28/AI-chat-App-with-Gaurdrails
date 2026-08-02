const { GoogleGenAI } = require('@google/genai');

// We initialize the client inside a function so we don't throw immediately 
// on startup if the API key is missing. This allows the server to start 
// and auth to work even before the key is provided.
let ai = null;

const getClient = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

/**
 * Calls the Gemini API with conversation history.
 * @param {Array} history - Array of previous messages [{ role: 'user', content: '...' }, ...]
 * @param {string} newMessage - The latest user message
 * @returns {Promise<string>} The assistant's reply
 */
const generateChatResponse = async (history, newMessage, modelPreference = 'mock') => {
  const client = getClient();

  // Map our internal history format to Gemini's expected Content format
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Append the new message
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  if (modelPreference === 'mock') {
    // TEMPORARY MOCK to bypass Google's Project Lock for testing
    // Simulate a 2-second network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `(Mocked AI Response) I heard you say: "${newMessage}". I'm running in offline test mode right now!`;
  }

  // Determine actual model string
  const actualModel = modelPreference === 'high' ? 'gemini-3.5-flash' : 'gemini-2.5-flash';

  try {
    const response = await client.models.generateContent({
      model: actualModel,
      contents: contents,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

module.exports = {
  generateChatResponse
};
