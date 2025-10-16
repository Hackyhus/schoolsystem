
import { defineFlow, generate } from '@/ai/genkit';
import { NarrateDataInputSchema, NarrateDataOutputSchema } from '../narrator';

export const narrateDataFlow = defineFlow(
  {
    name: 'narrateDataFlow',
    inputSchema: NarrateDataInputSchema,
    outputSchema: NarrateDataOutputSchema,
  },
  async (input) => {
    const { output } = await generate({
      prompt: `You are an expert data analyst and report writer for a school. Your task is to analyze the provided JSON data and write a short, human-readable narrative summary of the key findings.

      Context: ${input.context}
      
      Data:
      \`\`\`json
      ${JSON.stringify(input.data, null, 2)}
      \`\`\`

      Based on the data and context, write a 2-3 sentence summary.
      - Identify the most important trends, outliers, or key figures.
      - Do not just list the data; interpret it and provide a brief insight.
      - The tone should be professional and informative, suitable for a school administrator or department head.
      \n  Narrative:`,
      output: {
        schema: NarrateDataOutputSchema,
      },
    });
    return output;
  }
);
