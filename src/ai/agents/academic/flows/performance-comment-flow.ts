
import { ai } from '@/lib/genkit';
import { PerformanceCommentInputSchema, PerformanceCommentOutputSchema } from '../schemas/performance-comment-generator.schemas';

export const generateCommentFlow = ai.defineFlow(
  {
    name: 'generateCommentFlow',
    inputSchema: PerformanceCommentInputSchema,
    outputSchema: PerformanceCommentOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'gemini-1.5-flash',
      prompt: `You are an experienced and insightful Nigerian teacher writing a comment for a student's report card.
      Your name is not needed. The comment should be professional, encouraging, and constructive.

      Student's Name: ${input.studentName}
      
      Academic Performance:
      ${input.grades.map(g => `- Subject: ${g.name}, Score: ${g.score}/100, Grade: ${g.grade}`).join('\n')}

      Based on the data above, please write a concise (2-3 sentences) end-of-term comment.
      - Identify specific subjects where the student excels (high scores/grades like A, B).
      - Identify specific subjects where there is room for improvement (lower scores/grades like D, E, F).
      - Offer constructive advice or encouragement.
      - Do not mention every single subject; focus on the highlights and key areas for growth.
      - The comment should feel personal to ${input.studentName}.
      \n  Comment:`,
      output: {
        schema: PerformanceCommentOutputSchema,
      },
    });
    if (!output) {
      throw new Error('No output generated');
    }
    return output;
  }
);
