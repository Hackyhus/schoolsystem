
import { z } from 'zod';

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
