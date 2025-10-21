
'use server';

import {ai} from '@/lib/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  SummarizeTextInputSchema,
  SummarizeTextOutputSchema,
} from '../schemas/summarizer.schemas';
import { getContextTool, updateContextTool } from '../../../tools/context-tools';

export const summarizeTextFlow = ai.defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      tools: [getContextTool, updateContextTool],
      prompt: `You are an expert assistant tasked with summarizing text for professional review.
        Your goal is to provide a concise and informative summary that captures the key points of the provided content.

        Use the following context to tailor your summary.
        Context: ${input.context}
        Context ID: ${input.contextId || 'N/A'}

        Text to summarize: ${input.text}

        - If a contextId is provided, you can use the 'getContext' tool to understand previous steps in this conversation.
        - After generating the summary, if a contextId was provided, you MUST use the 'updateContext' tool to save your work to the conversation history.
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
