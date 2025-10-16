
'use server';
/**
 * @fileOverview An AI agent for drafting communications like announcements.
 *
 * - draftCommunication - A function that drafts text based on key points.
 * - DraftCommunicationInput - The input type for the draftCommunication function.
 * - DraftCommunicationOutput - The return type for the draftCommunication function.
 */

import { defineFlow, generate } from '@/ai/genkit';
import { z } from 'genkit';

export const DraftCommunicationInputSchema = z.object({
  points: z
    .string()
    .describe('A list of bullet points or a short topic for the announcement.'),
  audience: z
    .enum(['Parents', 'Staff', 'All Users'])
    .default('All Users')
    .describe('The target audience for the communication.'),
  tone: z
    .enum(['Formal', 'Friendly', 'Urgent'])
    .default('Formal')
    .describe('The desired tone of the communication.'),
});
export type DraftCommunicationInput = z.infer<typeof DraftCommunicationInputSchema>;

export const DraftCommunicationOutputSchema = z.object({
  draft: z.string().describe('The fully drafted communication text.'),
});
export type DraftCommunicationOutput = z.infer<typeof DraftCommunicationOutputSchema>;

const draftCommunicationFlow = defineFlow(
  {
    name: 'draftCommunicationFlow',
    inputSchema: DraftCommunicationInputSchema,
    outputSchema: DraftCommunicationOutputSchema,
  },
  async input => {
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

export async function draftCommunication(input: DraftCommunicationInput): Promise<DraftCommunicationOutput> {
  const flow = await draftCommunicationFlow;
  return flow(input);
}
