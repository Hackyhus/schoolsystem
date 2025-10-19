
import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  generate as genkitGenerate,
  defineFlow as genkitDefineFlow,
  definePrompt as genkitDefinePrompt,
  defineTool as genkitDefineTool,
} from 'genkit';

// Initialize the genkit AI instance
configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Re-export the core Genkit functions so server actions can import them
// This file does NOT have "use server" at the top
export const generate = genkitGenerate;
export const defineFlow = genkitDefineFlow;
export const definePrompt = genkitDefinePrompt;
export const defineTool = genkitDefineTool;
