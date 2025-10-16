
'use server';
/**
 * @fileOverview An AI agent for generating student performance comments for report cards.
 *
 * - generatePerformanceComment - A function that analyzes grades and writes a comment.
 * - PerformanceCommentInput - The input type for the generatePerformanceComment function.
 * - PerformanceCommentOutput - The return type for the generatePerformanceComment function.
 */

import { z } from 'zod';
import { generateCommentFlow } from './flows/performance-comment-flow';

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

export async function generatePerformanceComment(input: PerformanceCommentInput): Promise<PerformanceCommentOutput> {
  return generateCommentFlow(input);
}
