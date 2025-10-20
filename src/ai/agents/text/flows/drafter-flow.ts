
'use server';

import {ai} from '@/lib/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  DraftCommunicationInputSchema,
  DraftCommunicationOutputSchema,
} from '../schemas/drafter.schemas';
import { getDateTool } from '../../../tools/date-tool';

export const draftCommunicationFlow = ai.defineFlow(
  {
    name: 'draftCommunicationFlow',
    inputSchema: DraftCommunicationInputSchema,
    outputSchema: DraftCommunicationOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      tools: [getDateTool],
      prompt: `You are an expert school administrator's assistant. Your task is to draft a clear, professional, and well-structured announcement for a school portal based on the provided topic, audience, and tone.

      Topic: ${input.topic}
      Audience: ${input.audience}
      Tone: ${input.tone}

      - If the topic mentions any dates (e.g., "next Monday", "in three days"), you MUST use the provided getDate tool to calculate the exact date.
      - Expand on the topic to create a full announcement. Ensure the language is appropriate for the specified audience and tone.
      - Structure the announcement with a clear salutation (e.g., "Dear Parents," or "Dear Students, Parents, and Staff,"), a body with separate paragraphs for clarity, and a closing (e.g., "Sincerely, The School Administration").
      - Do not add a title. The output should be only the body of the announcement.
      \n  Draft:`,
      output: {
        schema: DraftCommunicationOutputSchema,
      },
    });
    if (!output) {
      throw new Error('No output generated');
    }
    return output;
  }
);
