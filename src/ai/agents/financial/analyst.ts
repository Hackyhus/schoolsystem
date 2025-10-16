
'use server';
/**
 * @fileOverview A financial analysis AI agent.
 *
 * - analyzeFinancials - A function that analyzes financial data and returns a summary.
 * - FinancialAnalysisInput - The input type for the analyzeFinancials function.
 * - FinancialAnalysisOutput - The return type for the analyzeFinancials function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const FinancialAnalysisInputSchema = z.object({
  totalRevenue: z.number().describe('The total revenue for the period.'),
  totalExpenses: z.number().describe('The total expenses for the period.'),
  netIncome: z.number().describe('The net income (revenue - expenses) for the period.'),
  currency: z.string().default('NGN').describe('The currency code, e.g., NGN.'),
});
export type FinancialAnalysisInput = z.infer<typeof FinancialAnalysisInputSchema>;

export const FinancialAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise, professional summary of the financial data provided.'),
});
export type FinancialAnalysisOutput = z.infer<typeof FinancialAnalysisOutputSchema>;

const analyzeFinancialsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialsFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async input => {
    const { output } = await ai.generate({
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

export async function analyzeFinancials(input: FinancialAnalysisInput): Promise<FinancialAnalysisOutput> {
  return analyzeFinancialsFlow(input);
}
