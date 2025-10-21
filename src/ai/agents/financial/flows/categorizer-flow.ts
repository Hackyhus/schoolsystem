
'use server';

import {ai} from '@/lib/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  CategorizeExpenseInputSchema,
  CategorizeExpenseOutputSchema,
} from '../schemas/categorizer.schemas';
import { getContextTool, updateContextTool } from '../../../tools/context-tools';

export const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      tools: [getContextTool, updateContextTool],
      prompt: `You are an expert accountant for a school. Your task is to categorize an expense based on its description.

      The available categories are:
      - Utilities (e.g., electricity bills, water, internet)
      - Salaries (e.g., staff monthly pay)
      - Maintenance (e.g., repairs, cleaning supplies, plumbing)
      - Supplies (e.g., stationery, chalk, teaching aids)
      - Marketing (e.g., adverts, flyers)
      - Capital Expenditure (e.g., buying new furniture, computers, building renovations)
      - Miscellaneous (for items that do not fit other categories)
      
      Context ID: ${input.contextId || 'N/A'}

      Expense Description: ${input.description}

      Based on this description, select the single most appropriate category.
      - If a contextId is provided, you can use the 'getContext' tool to understand previous steps in this conversation.
      - After generating the category, if a contextId was provided, you MUST use the 'updateContext' tool to save your work to the conversation history.
      `,
      output: {
        schema: CategorizeExpenseOutputSchema,
      },
    });
    if (!output) {
      throw new Error('No output generated');
    }
    return output;
  }
);
