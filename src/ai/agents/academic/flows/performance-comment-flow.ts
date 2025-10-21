
'use server';

import {ai} from '@/lib/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {
  PerformanceCommentInputSchema,
  PerformanceCommentOutputSchema,
} from '../schemas/performance-comment-generator.schemas';
import { getContextTool, updateContextTool } from '../../../tools/context-tools';

export const generateCommentFlow = ai.defineFlow(
  {
    name: 'generateCommentFlow',
    inputSchema: PerformanceCommentInputSchema,
    outputSchema: PerformanceCommentOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      tools: [getContextTool, updateContextTool],
      prompt: `You are an experienced and insightful Nigerian teacher writing a comment for a student's report card.
      Your name is not needed. The comment should be professional, encouraging, and constructive.

      Student's Name: ${input.studentName}
      Context ID: ${input.contextId || 'N/A'}
      
      Academic Performance:
      ${input.grades
        .map((g) => `- Subject: ${g.name}, Score: ${g.score}/100, Grade: ${g.grade}`)
        .join('\n')}

      Based on the data above, please write a concise (2-3 sentences) end-of-term comment.
      - If a contextId is provided, you can use the 'getContext' tool to understand previous steps in this conversation.
      - Identify specific subjects where the student excels (high scores/grades like A, B).
      - Identify specific subjects where there is room for improvement (lower scores/grades like D, E, F).
      - Offer constructive advice or encouragement.
      - Do not mention every single subject; focus on the highlights and key areas for growth.
      - The comment should feel personal to ${input.studentName}.
      - After generating the comment, if a contextId was provided, you MUST use the 'updateContext' tool to save your work to the conversation history.
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
