
import { defineFlow, generate } from '@/ai/genkit';
import { CategorizeExpenseInputSchema, CategorizeExpenseOutputSchema } from '../categorizer';

export const EXPENSE_CATEGORIES = ['Utilities', 'Salaries', 'Maintenance', 'Supplies', 'Marketing', 'Capital Expenditure', 'Miscellaneous'] as const;

export const categorizeExpenseFlow = defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async (input) => {
    const { output } = await generate({
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
