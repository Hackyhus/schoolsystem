
'use server';

import {ai} from '@/lib/genkit';
import {
  SummarizeTextInputSchema,
  SummarizeTextOutputSchema,
} from '../schemas/summarizer.schemas';

export const summarizeTextFlow = ai.defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: 'gemini-1.5-flash',
      prompt: `You are an expert assistant tasked with summarizing text for professional review.
        Your goal is to provide a concise and informative summary that captures the key points of the provided content.

        Use the following context to tailor your summary.
        Context: ${input.context}

        Text to summarize: ${input.text}
        \n  Summary:`,
      output: {
        schema: SummarizeTextOutputSchema,
      },
    });
    if (!output) {
      throw new Error('No output generated');
    }
    return output;
  }
);
