
'use server';
/**
 * @fileOverview A financial analysis AI agent.
 *
 * - analyzeFinancials - A function that analyzes financial data and returns a summary.
 * - FinancialAnalysisInput - The input type for the analyzeFinancials function.
 * - FinancialAnalysisOutput - The return type for the analyzeFinancials function.
 */

import { z } from 'zod';
import { analyzeFinancialsFlow } from './flows/analyst-flow';

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

export async function analyzeFinancials(input: FinancialAnalysisInput): Promise<FinancialAnalysisOutput> {
  return analyzeFinancialsFlow(input);
}
