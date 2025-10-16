
'use server';
/**
 * @fileOverview A generic text summarization AI agent.
 *
 * - summarizeText - A function that summarizes a given piece of text.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import { summarizeTextFlow } from './flows/summarizer-flow';
import type { SummarizeTextInput, SummarizeTextOutput } from './schemas/summarizer.schemas';
export type { SummarizeTextInput, SummarizeTextOutput };


export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  return summarizeTextFlow(input);
}
