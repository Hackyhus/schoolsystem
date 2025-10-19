'use server';
/**
 * @fileOverview An AI agent for categorizing financial expenses.
 *
 * - categorizeExpense - A function that suggests a category for an expense.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import { categorizeExpenseFlow } from './flows/categorizer-flow';
import type { CategorizeExpenseInput, CategorizeExpenseOutput } from './schemas/categorizer.schemas';
export type { CategorizeExpenseInput, CategorizeExpenseOutput };

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  const flow = await categorizeExpenseFlow;
  return flow(input);
}
