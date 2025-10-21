
'use server';

import {ai} from '@/lib/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  FinancialAnalysisInputSchema,
  FinancialAnalysisOutputSchema,
} from '../schemas/analyst.schemas';
import { getContextTool, updateContextTool } from '../../../tools/context-tools';

export const analyzeFinancialsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialsFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      tools: [getContextTool, updateContextTool],
      prompt: `You are an expert financial analyst for a school. Your task is to provide a clear and concise summary of the financial performance for a given period.

      Context ID: ${input.contextId || 'N/A'}

      Use the following data:
      - Total Revenue: ${input.currency} ${input.totalRevenue}
      - Total Expenses: ${input.currency} ${input.totalExpenses}
      - Net Income: ${input.currency} ${input.netIncome}

      Based on this data, write a short, professional summary. Mention the key figures and the resulting net income.
      - If a contextId is provided, you can use the 'getContext' tool to understand previous steps in this conversation.
      - After generating the summary, if a contextId was provided, you MUST use the 'updateContext' tool to save your work to the conversation history.
      \n  Summary:`,
      output: {
        schema: FinancialAnalysisOutputSchema,
      },
    });
    if (!output) {
      throw new Error('No output generated');
    }
    return output;
  }
);
