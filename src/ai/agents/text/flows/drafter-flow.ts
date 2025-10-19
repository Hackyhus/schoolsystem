
import { ai } from '@/ai/genkit';
import { DraftCommunicationInputSchema, DraftCommunicationOutputSchema } from '../schemas/drafter.schemas';

export const draftCommunicationFlow = ai.defineFlow(
  {
    name: 'draftCommunicationFlow',
    inputSchema: DraftCommunicationInputSchema,
    outputSchema: DraftCommunicationOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'gemini-1.5-flash',
      prompt: `You are an expert school administrator's assistant. Your task is to draft a clear, professional, and well-structured announcement for a school portal based on the provided key points.

      Target Audience: ${input.audience}
      Desired Tone: ${input.tone}
      
      Key Points to include:
      ${input.points}

      Expand on these points to create a full announcement. Ensure the language is appropriate for the target audience and tone. Do not add a title.
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
