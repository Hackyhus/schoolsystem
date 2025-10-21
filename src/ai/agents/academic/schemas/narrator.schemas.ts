
import { z } from 'zod';

export const NarrateDataInputSchema = z.object({
  context: z.string().describe('A description of what the data represents, e.g., "A list of teacher submission statistics for the science department."'),
  data: z.any().describe("The structured data to be analyzed, provided as a JSON object or array."),
  contextId: z.string().optional().describe('An optional ID for maintaining conversation context across multiple AI calls.'),
});
export type NarrateDataInput = z.infer<typeof NarrateDataInputSchema>;

export const NarrateDataOutputSchema = z.object({
  narrative: z.string().describe('A concise, insightful narrative summary of the key trends and points from the data.'),
});
export type NarrateDataOutput = z.infer<typeof NarrateDataOutputSchema>;
