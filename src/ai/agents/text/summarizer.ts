'use server';
/**
 * @fileOverview A generic text summarization AI agent.
 *
 * - summarizeText - A function that summarizes a given piece of text.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SummarizeTextInputSchema = z.object({
  text: z
    .string()
    .describe('The text to be summarized.'),
  context: z
    .string()
    .describe('The context of what the text is about, e.g., "a lesson note for primary school students" or "a quarterly financial expense report".')
    .optional(),
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

export const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided text.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  input: {schema: SummarizeTextInputSchema},
  output: {schema: SummarizeTextOutputSchema},
  prompt: `You are an expert assistant tasked with summarizing text for professional review.
  Your goal is to provide a concise and informative summary that captures the key points of the provided content.

  Use the following context to tailor your summary.
  Context: {{{context}}}

  Text to summarize: {{{text}}}
  \n  Summary:`,
});

const summarizeTextFlow = ai.defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  return summarizeTextFlow(input);
}
