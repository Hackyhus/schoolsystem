import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize the genkit AI instance
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
