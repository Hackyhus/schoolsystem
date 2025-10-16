
import { defineFlow, generate } from '@/ai/genkit';
import { SummarizeTextInputSchema, SummarizeTextOutputSchema } from '../summarizer';

export const summarizeTextFlow = defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async (input) => {
    const { output } = await generate({
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
    return output;
  }
);
