
'use server';

import { genkit, type GenkitOptions } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { dbService } from '@/lib/firebase';
import type { SafetySetting } from 'genkit';

const baseAi = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
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

const generateWithSafety = async (options: GenkitOptions) => {
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

export const ai = {
  ...baseAi,
  generate: generateWithSafety,
};
