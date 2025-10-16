
'use server';
/**
 * @fileOverview An AI agent for categorizing financial expenses.
 *
 * - categorizeExpense - A function that suggests a category for an expense.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import { z } from 'zod';
import { categorizeExpenseFlow, EXPENSE_CATEGORIES } from './flows/categorizer-flow';

export const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('The description of the expense item.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

export const CategorizeExpenseOutputSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).describe('The most likely category for this expense.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;


export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}
