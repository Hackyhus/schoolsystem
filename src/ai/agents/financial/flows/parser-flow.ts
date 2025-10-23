'use server';

import {ai} from '@/lib/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  ParseStudentNameInputSchema,
  ParseStudentNameOutputSchema,
} from '../schemas/parser.schemas';
import { findStudentInvoiceTool } from '../../../tools/financial-tools';

export const parseStudentNameFlow = ai.defineFlow(
  {
    name: 'parseStudentNameFlow',
    inputSchema: ParseStudentNameInputSchema,
    outputSchema: ParseStudentNameOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      tools: [findStudentInvoiceTool],
      prompt: `You are an expert at parsing text. Your task is to extract a student's full name from a bank transaction description, and then use that name to find their latest unpaid invoice.

      Examples:
      - Input: "NIBSS/SCHOOL FEES-IBRAHIM LAWAL/PSSP" -> You will first extract "Ibrahim Lawal", then call the findStudentInvoiceTool with "Ibrahim Lawal".
      - Input: "TRANSFER from ADAMU MUSA" -> You will first extract "Adamu Musa", then call the findStudentInvoiceTool with "Adamu Musa".
      - Input: "School fees for JSS1" -> No name found, do not call the tool.
      - Input: "GTB/ADEKUNLE CIROMA/FEES" -> You will first extract "Adekunle Ciroma", then call the findStudentInvoiceTool with "Adekunle Ciroma".

      Transaction Description: "${input.description}"

      1.  First, extract the full student name from the description. The name is likely in all caps and may be preceded or followed by other text. Return the name in title case (e.g., "Firstname Lastname").
      2.  If you successfully identify a name, you MUST use the 'findStudentInvoice' tool with the extracted name to find their most recent invoice ID.
      3.  Return both the extracted name and the invoice ID found by the tool. If no name is clearly identifiable, return null for both fields.
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
