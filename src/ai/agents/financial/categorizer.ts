
'use server';
/**
 * @fileOverview An AI agent for categorizing financial expenses.
 *
 * - categorizeExpense - A function that suggests a category for an expense.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EXPENSE_CATEGORIES = ['Utilities', 'Salaries', 'Maintenance', 'Supplies', 'Marketing', 'Capital Expenditure', 'Miscellaneous'] as const;

export const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('The description of the expense item.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

export const CategorizeExpenseOutputSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).describe('The most likely category for this expense.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const { output } = await ai.generate({
      prompt: `You are an expert accountant for a school. Your task is to categorize an expense based on its description.

      The available categories are:
      - Utilities (e.g., electricity bills, water, internet)
      - Salaries (e.g., staff monthly pay)
      - Maintenance (e.g., repairs, cleaning supplies, plumbing)
      - Supplies (e.g., stationery, chalk, teaching aids)
      - Marketing (e.g., adverts, flyers)
      - Capital Expenditure (e.g., buying new furniture, computers, building renovations)
      - Miscellaneous (for items that do not fit other categories)

      Expense Description: ${input.description}

      Based on this description, select the single most appropriate category.
      `,
      output: {
        schema: CategorizeExpenseOutputSchema,
      },
    });
    return output;
  }
);

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}
