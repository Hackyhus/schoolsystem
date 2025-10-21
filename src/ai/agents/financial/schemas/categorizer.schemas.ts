
import { z } from 'zod';

export const EXPENSE_CATEGORIES = ['Utilities', 'Salaries', 'Maintenance', 'Supplies', 'Marketing', 'Capital Expenditure', 'Miscellaneous'] as const;

export const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('The description of the expense item.'),
  contextId: z.string().optional().describe('An optional ID for maintaining conversation context across multiple AI calls.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

export const CategorizeExpenseOutputSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).describe('The most likely category for this expense.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;
