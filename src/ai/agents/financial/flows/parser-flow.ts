'use server';

import {ai} from '@/lib/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  ParseStudentNameInputSchema,
  ParseStudentNameOutputSchema,
} from '../schemas/parser.schemas';

export const parseStudentNameFlow = ai.defineFlow(
  {
    name: 'parseStudentNameFlow',
    inputSchema: ParseStudentNameInputSchema,
    outputSchema: ParseStudentNameOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: `You are an expert at parsing text. Your task is to extract a student's full name from a bank transaction description. The name will likely be in all caps and may be preceded or followed by other text and symbols.

      Examples:
      - Input: "NIBSS/SCHOOL FEES-IBRAHIM LAWAL/PSSP" -> Output: "Ibrahim Lawal"
      - Input: "TRANSFER from ADAMU MUSA" -> Output: "Adamu Musa"
      - Input: "School fees for JSS1" -> Output: null
      - Input: "GTB/ADEKUNLE CIROMA/FEES" -> Output: "Adekunle Ciroma"

      Transaction Description: "${input.description}"

      Based on the description, extract the full student name. If no name is clearly identifiable, return null. Return the name in title case (e.g., "Firstname Lastname").
      `,
      output: {
        schema: ParseStudentNameOutputSchema,
      },
    });
    if (!output) {
      throw new Error('No output generated');
    }
    return output;
  }
);
