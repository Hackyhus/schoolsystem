
import { z } from 'zod';

export const DraftCommunicationInputSchema = z.object({
  topic: z
    .string()
    .describe('The main topic or key points for the announcement. e.g., "Announce a 3-day mid-term break starting next Monday."'),
  audience: z
    .enum(['Parents', 'Staff', 'All Users'])
    .default('All Users')
    .describe('The primary target audience for the communication, which will influence the language and salutation.'),
  tone: z
    .enum(['Formal', 'Friendly', 'Urgent'])
    .default('Formal')
    .describe('The desired tone of the communication, influencing the wording and urgency.'),
  contextId: z.string().optional().describe('An optional ID for maintaining conversation context across multiple AI calls.'),
});
export type DraftCommunicationInput = z.infer<typeof DraftCommunicationInputSchema>;

export const DraftCommunicationOutputSchema = z.object({
  draft: z.string().describe('The fully drafted communication text, complete with salutation, body, and closing.'),
});
export type DraftCommunicationOutput = z.infer<typeof DraftCommunicationOutputSchema>;
