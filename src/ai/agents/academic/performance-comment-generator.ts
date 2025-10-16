
'use server';
/**
 * @fileOverview An AI agent for generating student performance comments for report cards.
 *
 * - generatePerformanceComment - A function that analyzes grades and writes a comment.
 * - PerformanceCommentInput - The input type for the generatePerformanceComment function.
 * - PerformanceCommentOutput - The return type for the generatePerformanceComment function.
 */

import { generateCommentFlow } from './flows/performance-comment-flow';
import type { PerformanceCommentInput, PerformanceCommentOutput } from './schemas/performance-comment-generator.schemas';
export type { PerformanceCommentInput, PerformanceCommentOutput };


export async function generatePerformanceComment(input: PerformanceCommentInput): Promise<PerformanceCommentOutput> {
  return generateCommentFlow(input);
}
