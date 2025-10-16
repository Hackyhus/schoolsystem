
import { genkit, type GenkitConfig } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { dbService } from '@/lib/firebase';
import type { SafetySetting } from 'genkit';

let aiInstance: any;

async function getAIConfig(): Promise<GenkitConfig> {
  let safetySettings: SafetySetting[] | undefined;
  try {
    const configDoc = await dbService.getDoc<{ safetySettings?: SafetySetting[] }>('system', 'aiConfig');
    if (configDoc?.safetySettings) {
      safetySettings = configDoc.safetySettings;
    }
  } catch (error) {
    console.error("Could not fetch AI safety settings from Firestore. Using defaults.", error);
  }

  return {
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
    config: {
      safetySettings,
    },
  };
}

// Singleton pattern to ensure genkit is initialized only once
async function initializeGenkit() {
  if (!aiInstance) {
    const config = await getAIConfig();
    aiInstance = genkit(config);
  }
  return aiInstance;
}

// We export a promise that resolves to the initialized genkit instance.
// This feels a bit complex, but it's to handle the async loading of config.
// A simpler approach would be to not have dynamic config.
// Let's simplify. We will initialize on first call.

let aiPromise: Promise<any> | null = null;

const getGenkit = (): Promise<any> => {
    if (!aiPromise) {
        aiPromise = (async () => {
            const config = await getAIConfig();
            return genkit(config);
        })();
    }
    return aiPromise;
};

// We will modify agents to await this getter.
// This is getting complicated. Let's make `ai` a proxy object.

class GenkitProxy {
    private _instance: Promise<any>;

    constructor() {
        this._instance = this.initialize();
    }

    private async initialize() {
        const config = await getAIConfig();
        return genkit(config);
    }
    
    async defineFlow(name: any, fn: any) {
        const i = await this._instance;
        return i.defineFlow(name, fn);
    }
    
     async definePrompt(opts: any) {
        const i = await this._instance;
        return i.definePrompt(opts);
    }
}

// This also doesn't work because `ai.defineFlow` is called at the top level, not inside an async function.
// Let's go with the simplest approach for now: top-level await is not supported,
// so we'll fetch config inside the flows/prompts if needed. But config is on the model.

// Let's re-think. The config can be passed to each `generate` call.
// So, we don't need to initialize genkit with it. We can create a helper.

const baseAi = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

// We'll export the base `ai` object and a helper to get config.
export const ai = baseAi;

export async function getModelConfig() {
    try {
        const configDoc = await dbService.getDoc<{ safetySettings?: SafetySetting[] }>('system', 'aiConfig');
        if (configDoc?.safetySettings) {
            return { safetySettings: configDoc.safetySettings };
        }
    } catch (error) {
        console.warn("Could not fetch AI safety settings. Using model defaults.", error);
    }
    return {};
}

// The agents will need to be updated to use this.
// For example:
// const { output } = await prompt(input, { config: await getModelConfig() });
// This is not ideal as it adds boilerplate to every call.

// Let's stick with the original simple genkit.ts and modify the agents to fetch config.
// This is the least intrusive change.

// Reverting to the simple setup. The agents will be modified.

export { }; // remove this export
// The above is getting too complex. The issue is that the AI agents are defined at module load time,
// but the config is fetched asynchronously.

// A cleaner way is to wrap the `generate` call inside the flows.
// But definePrompt doesn't let us do that.

// OK, final plan. Let's define the config in `definePrompt`.
// `definePrompt` can't be async.
// The config must be passed to the prompt call itself. `prompt(input, { config: ... })`

// Let's try to make the genkit object itself dynamic.

const aiWithDynamicConfig = {
    ...baseAi,
    generate: async (options: any) => {
        const dynamicConfig = await getModelConfig();
        const finalOptions = {
            ...options,
            config: {
                ...dynamicConfig,
                ...options.config,
            }
        };
        return baseAi.generate(finalOptions);
    },
    // We would need to proxy `definePrompt` and `defineFlow` as well, which is complex.
};


// The simplest, most robust solution is to modify the AI agent flows to fetch the config.
// I will proceed with this. I will create a new `ai/config.ts` to centralize this logic.
// `genkit.ts` will remain simple.

// src/ai/genkit.ts
// Stays as it was.

// src/ai/config.ts (New file)
// export async function getAIConfig() { ... }

// src/ai/agents/text/summarizer.ts (Example modification)
// import { getAIConfig } from '../../config.ts';
// ...
// const { output } = await prompt(input, { config: await getAIConfig() });
// And the prompt definition itself cannot have config.

// Let's modify genkit.ts to export a configured `generate` function
// that all agents can use. This encapsulates the logic in one place.

const finalAi = {
  ...baseAi,
  generateWithSafety: async (options: any) => {
    const safetyConfig = await getModelConfig();
    const finalOptions = { ...options, config: { ...options.config, ...safetyConfig } };
    return baseAi.generate(finalOptions);
  },
};

export const aiWithSafety = finalAi;
