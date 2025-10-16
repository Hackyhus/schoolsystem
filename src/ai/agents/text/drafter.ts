
'use server';
/**
 * @fileOverview An AI agent for drafting communications like announcements.
 *
 * - draftCommunication - A function that drafts text based on key points.
 * - DraftCommunicationInput - The input type for the draftCommunication function.
 * - DraftCommunicationOutput - The return type for the draftCommunication function.
 */

import { z } from 'zod';
import { draftCommunicationFlow } from './flows/drafter-flow';


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


export async function draftCommunication(input: DraftCommunicationInput): Promise<DraftCommunicationOutput> {
  return draftCommunicationFlow(input);
}
