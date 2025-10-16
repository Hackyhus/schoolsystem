
'use server';
/**
 * @fileOverview An AI agent for creating narrative summaries from structured data.
 *
 * - narrateData - A function that analyzes structured data and provides a summary.
 * - NarrateDataInput - The input type for the narrateData function.
 * - NarrateDataOutput - The return type for the narrateData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const NarrateDataInputSchema = z.object({
  context: z.string().describe('A description of what the data represents, e.g., "A list of teacher submission statistics for the science department."'),
  data: z.any().describe("The structured data to be analyzed, provided as a JSON object or array."),
});
export type NarrateDataInput = z.infer<typeof NarrateDataInputSchema>;

export const NarrateDataOutputSchema = z.object({
  narrative: z.string().describe('A concise, insightful narrative summary of the key trends and points from the data.'),
});
export type NarrateDataOutput = z.infer<typeof NarrateDataOutputSchema>;

const prompt = ai.definePrompt({
  name: 'narrateDataPrompt',
  input: {schema: NarrateDataInputSchema},
  output: {schema: NarrateDataOutputSchema},
  prompt: `You are an expert data analyst and report writer for a school. Your task is to analyze the provided JSON data and write a short, human-readable narrative summary of the key findings.

  Context: {{{context}}}
  
  Data:
  \`\`\`json
  {{{json data}}}
  \`\`\`

  Based on the data and context, write a 2-3 sentence summary.
  - Identify the most important trends, outliers, or key figures.
  - Do not just list the data; interpret it and provide a brief insight.
  - The tone should be professional and informative, suitable for a school administrator or department head.
  \n  Narrative:`,
});

const narrateDataFlow = ai.defineFlow(
  {
    name: 'narrateDataFlow',
    inputSchema: NarrateDataInputSchema,
    outputSchema: NarrateDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function narrateData(input: NarrateDataInput): Promise<NarrateDataOutput> {
  return narrateDataFlow(input);
}
