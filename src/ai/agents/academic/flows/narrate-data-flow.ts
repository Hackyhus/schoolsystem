
'use server';

import {ai} from '@/lib/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  NarrateDataInputSchema,
  NarrateDataOutputSchema,
} from '../schemas/narrator.schemas';
import { getContextTool, updateContextTool } from '../../../tools/context-tools';

export const narrateDataFlow = ai.defineFlow(
  {
    name: 'narrateDataFlow',
    inputSchema: NarrateDataInputSchema,
    outputSchema: NarrateDataOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      tools: [getContextTool, updateContextTool],
      prompt: `You are an expert data analyst and report writer for a school. Your task is to analyze the provided JSON data and write a short, human-readable narrative summary of the key findings.

      Context: ${input.context}
      Context ID: ${input.contextId || 'N/A'}
      
      Data:
      \`\`\`json
      ${JSON.stringify(input.data, null, 2)}
      \`\`\`

      Based on the data and context, write a 2-3 sentence summary.
      - If a contextId is provided, you can use the 'getContext' tool to understand previous steps in this conversation.
      - Identify the most important trends, outliers, or key figures.
      - Do not just list the data; interpret it and provide a brief insight.
      - The tone should be professional and informative, suitable for a school administrator or department head.
      - After generating the summary, if a contextId was provided, you MUST use the 'updateContext' tool to save your work to the conversation history.
      \n  Narrative:`,
      output: {
        schema: NarrateDataOutputSchema,
      },
    });
    if (!output) {
      throw new Error('No output generated');
    }
    return output;
  }
);
