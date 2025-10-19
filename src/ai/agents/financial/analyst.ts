'use server';
/**
 * @fileOverview A financial analysis AI agent.
 *
 * - analyzeFinancials - A function that analyzes financial data and returns a summary.
 * - FinancialAnalysisInput - The input type for the analyzeFinancials function.
 * - FinancialAnalysisOutput - The return type for the analyzeFinancials function.
 */

import { analyzeFinancialsFlow } from './flows/analyst-flow';
import type { FinancialAnalysisInput, FinancialAnalysisOutput } from './schemas/analyst.schemas';
export type { FinancialAnalysisInput, FinancialAnalysisOutput };

export async function analyzeFinancials(input: FinancialAnalysisInput): Promise<FinancialAnalysisOutput> {
  const flow = await analyzeFinancialsFlow;
  return flow(input);
}
