
'use server';

import {ai} from '@/lib/genkit';
import {
  FinancialAnalysisInputSchema,
  FinancialAnalysisOutputSchema,
} from '../schemas/analyst.schemas';

export const analyzeFinancialsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialsFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: 'gemini-1.5-flash',
      prompt: `You are an expert financial analyst for a school. Your task is to provide a clear and concise summary of the financial performance for a given period.

      Use the following data:
      - Total Revenue: ${input.currency} ${input.totalRevenue}
      - Total Expenses: ${input.currency} ${input.totalExpenses}
      - Net Income: ${input.currency} ${input.netIncome}

      Based on this data, write a short, professional summary. Mention the key figures and the resulting net income.
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
