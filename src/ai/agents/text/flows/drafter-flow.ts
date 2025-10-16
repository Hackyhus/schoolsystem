
import { defineFlow, generate } from '@/ai/genkit';
import { DraftCommunicationInputSchema, DraftCommunicationOutputSchema } from '../drafter';

export const draftCommunicationFlow = defineFlow(
  {
    name: 'draftCommunicationFlow',
    inputSchema: DraftCommunicationInputSchema,
    outputSchema: DraftCommunicationOutputSchema,
  },
  async (input) => {
    const { output } = await generate({
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
    return output;
  }
);
