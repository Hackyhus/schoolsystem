
import { z } from 'zod';

export const FinancialAnalysisInputSchema = z.object({
  totalRevenue: z.number().describe('The total revenue for the period.'),
  totalExpenses: z.number().describe('The total expenses for the period.'),
  netIncome: z.number().describe('The net income (revenue - expenses) for the period.'),
  currency: z.string().default('NGN').describe('The currency code, e.g., NGN.'),
  contextId: z.string().optional().describe('An optional ID for maintaining conversation context across multiple AI calls.'),
});
export type FinancialAnalysisInput = z.infer<typeof FinancialAnalysisInputSchema>;

export const FinancialAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise, professional summary of the financial data provided.'),
});
export type FinancialAnalysisOutput = z.infer<typeof FinancialAnalysisOutputSchema>;
