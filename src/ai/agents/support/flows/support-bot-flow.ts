
'use server';

import { ai } from '@/lib/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  SupportBotInputSchema,
  SupportBotOutputSchema,
} from '../schemas/support-bot.schemas';
import { KNOWLEDGE_BASE } from '@/ai/knowledge-base';

// Define the flow that uses the prompt
export const supportBotFlow = ai.defineFlow(
  {
    name: 'supportBotFlow',
    inputSchema: SupportBotInputSchema,
    outputSchema: SupportBotOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: `You are the GIIA Support Bot, a friendly and helpful AI assistant for the "InsightConnect Portal" application. Your personality is professional yet conversational.

      - When asked your name, identify yourself as the GIIA Support Bot.
      - Handle greetings and simple small talk naturally before guiding the user back to the portal's features.
      - Your primary goal is to answer questions about the InsightConnect Portal (its features, routes, and permissions) based ONLY on the provided Knowledge Base.
      - If a user's question is about a feature NOT in the knowledge base, politely state that you don't have information on that topic and suggest they ask about something you do know about (e.g., "managing students" or "submitting lesson plans").
      - Keep your answers helpful and concise. Do not invent features or routes that are not in the knowledge base.

      Current User's Role: ${input.role}

      Knowledge Base:
      ---
      ${KNOWLEDGE_BASE}
      ---

      Conversation History:
      ${input.history.map(m => `${m.role}: ${m.content}`).join('\n')}
      
      New User Question: ${input.question}

      Based on the rules above, provide a helpful and natural-sounding answer to the new question.
      `,
       output: {
        schema: SupportBotOutputSchema,
      },
    });
    if (!output) {
        throw new Error('No output generated');
    }
    return output;
  }
);
