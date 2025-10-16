
'use server';
/**
 * @fileOverview An AI agent for generating student performance comments for report cards.
 *
 * - generatePerformanceComment - A function that analyzes grades and writes a comment.
 * - PerformanceCommentInput - The input type for the generatePerformanceComment function.
 * - PerformanceCommentOutput - The return type for the generatePerformanceComment function.
 */

import { defineFlow, generate } from '@/ai/genkit';
import { z } from 'genkit';

const SubjectPerformanceSchema = z.object({
  name: z.string().describe('The name of the subject.'),
  score: z.number().describe('The total score obtained in the subject (out of 100).'),
  grade: z.string().describe('The letter grade obtained for the score.'),
});

export const PerformanceCommentInputSchema = z.object({
  studentName: z.string().describe("The student's first name."),
  grades: z.array(SubjectPerformanceSchema).describe("An array of the student's performance in each subject."),
});
export type PerformanceCommentInput = z.infer<typeof PerformanceCommentInputSchema>;

export const PerformanceCommentOutputSchema = z.object({
  comment: z.string().describe('A professional, insightful, and constructive comment for the student\'s report card, written from the perspective of a class teacher. The tone should be encouraging.'),
});
export type PerformanceCommentOutput = z.infer<typeof PerformanceCommentOutputSchema>;

const generateCommentFlow = defineFlow(
  {
    name: 'generateCommentFlow',
    inputSchema: PerformanceCommentInputSchema,
    outputSchema: PerformanceCommentOutputSchema,
  },
  async input => {
    const { output } = await generate({
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
    return output;
  }
);

export async function generatePerformanceComment(input: PerformanceCommentInput): Promise<PerformanceCommentOutput> {
  const flow = await generateCommentFlow;
  return flow(input);
}
