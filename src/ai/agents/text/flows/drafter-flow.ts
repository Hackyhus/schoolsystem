
'use server';

import {ai} from '@/lib/genkit';
import {
  DraftCommunicationInputSchema,
  DraftCommunicationOutputSchema,
} from '../schemas/drafter.schemas';

export const draftCommunicationFlow = ai.defineFlow(
  {
    name: 'draftCommunicationFlow',
    inputSchema: DraftCommunicationInputSchema,
    outputSchema: DraftCommunicationOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: 'gemini-2.5-flash',
      prompt: `You are an expert school administrator's assistant. Your task is to draft a clear, professional, and well-structured announcement for a school portal based on the provided topic.

      Topic: ${input.topic}

      Expand on this topic to create a full announcement. Ensure the language is appropriate for a formal announcement to all users. Do not add a title.
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
