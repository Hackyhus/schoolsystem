
import { defineFlow, generate } from '@/ai/genkit';
import { FinancialAnalysisInputSchema, FinancialAnalysisOutputSchema } from '../analyst';

export const analyzeFinancialsFlow = defineFlow(
  {
    name: 'analyzeFinancialsFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await generate({
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
    return output;
  }
);
