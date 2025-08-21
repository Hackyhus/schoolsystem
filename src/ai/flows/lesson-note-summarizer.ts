'use server';
/**
 * @fileOverview AI agent to summarize lesson notes for efficient review and approval.
 *
 * - summarizeLessonNotes - A function that summarizes lesson notes.
 * - SummarizeLessonNotesInput - The input type for the summarizeLessonNotes function.
 * - SummarizeLessonNotesOutput - The return type for the summarizeLessonNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLessonNotesInputSchema = z.object({
  lessonNotes: z
    .string()
    .describe('The lesson notes to be summarized.'),
});
export type SummarizeLessonNotesInput = z.infer<typeof SummarizeLessonNotesInputSchema>;

const SummarizeLessonNotesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the lesson notes.'),
});
export type SummarizeLessonNotesOutput = z.infer<typeof SummarizeLessonNotesOutputSchema>;

export async function summarizeLessonNotes(input: SummarizeLessonNotesInput): Promise<SummarizeLessonNotesOutput> {
  return summarizeLessonNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLessonNotesPrompt',
  input: {schema: SummarizeLessonNotesInputSchema},
  output: {schema: SummarizeLessonNotesOutputSchema},
  prompt: `You are an expert educator tasked with summarizing lesson notes for review by a Head of Department or Administrator.
  Your goal is to provide a concise and informative summary that captures the key points of the lesson.

  Lesson Notes: {{{lessonNotes}}}
  \n  Summary:`, // add a newline character to better align with Google's example outputs. Can improve quality and token usage.
});

const summarizeLessonNotesFlow = ai.defineFlow(
  {
    name: 'summarizeLessonNotesFlow',
    inputSchema: SummarizeLessonNotesInputSchema,
    outputSchema: SummarizeLessonNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
