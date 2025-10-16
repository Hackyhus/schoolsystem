
'use server';
/**
 * @fileOverview An AI agent for creating narrative summaries from structured data.
 *
 * - narrateData - A function that analyzes structured data and provides a summary.
 * - NarrateDataInput - The input type for the narrateData function.
 * - NarrateDataOutput - The return type for the narrateData function.
 */

import { z } from 'zod';
import { narrateDataFlow } from './flows/narrate-data-flow';

export const NarrateDataInputSchema = z.object({
  context: z.string().describe('A description of what the data represents, e.g., "A list of teacher submission statistics for the science department."'),
  data: z.any().describe("The structured data to be analyzed, provided as a JSON object or array."),
});
export type NarrateDataInput = z.infer<typeof NarrateDataInputSchema>;

export const NarrateDataOutputSchema = z.object({
  narrative: z.string().describe('A concise, insightful narrative summary of the key trends and points from the data.'),
});
export type NarrateDataOutput = z.infer<typeof NarrateDataOutputSchema>;

export async function narrateData(input: NarrateDataInput): Promise<NarrateDataOutput> {
  return narrateDataFlow(input);
}
