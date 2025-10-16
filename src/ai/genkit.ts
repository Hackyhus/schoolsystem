
'use server';

import { genkit, type GenkitOptions } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { dbService } from '@/lib/firebase';
import type { SafetySetting } from 'genkit';

const baseAi = genkit({
  plugins: [googleAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })],
  model: 'googleai/gemini-pro',
});

async function getModelConfig() {
    try {
        const configDoc = await dbService.getDoc<{ safetySettings?: SafetySetting[] }>('system', 'aiConfig');
        if (configDoc?.safetySettings) {
            return { safetySettings: configDoc.safetySettings };
        }
    } catch (error) {
        console.warn("Could not fetch AI safety settings from Firestore. Using model defaults.", error);
    }
    return {};
}

export async function generate(options: GenkitOptions) {
    const safetyConfig = await getModelConfig();
    const finalOptions = {
        ...options,
        config: {
            ...safetyConfig,
            ...options.config,
        }
    };
    return baseAi.generate(finalOptions);
};

export async function defineFlow(...args: Parameters<typeof baseAi.defineFlow>) {
    return baseAi.defineFlow(...args);
}

export async function definePrompt(...args: Parameters<typeof baseAi.definePrompt>) {
    return baseAi.definePrompt(...args);
}

export async function defineTool(...args: Parameters<typeof baseAi.defineTool>) {
    return baseAi.defineTool(...args);
}
