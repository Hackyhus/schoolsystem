
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
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `You are an expert AI assistant for the "InsightConnect Portal", a school management application. Your goal is to answer user questions based ONLY on the provided knowledge base. Do not invent features or routes.

      Current User's Role: ${input.role}

      Knowledge Base:
      ---
      ${KNOWLEDGE_BASE}
      ---

      Conversation History:
      ${input.history.map(m => `${m.role}: ${m.content}`).join('\n')}
      
      New User Question: ${input.question}

      Based on the knowledge base and the user's role, provide a helpful and concise answer to the new question.
      - If the user asks about a feature, explain what it does and where to find it.
      - If you don't know the answer or it's not in the knowledge base, say "I'm sorry, I don't have information on that topic."
      - Keep your answers short and to the point.
      `,
       output: {
        schema: SupportBotOutputSchema,
      },
    });
    return output!;
  }
);
