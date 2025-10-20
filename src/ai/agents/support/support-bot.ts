
'use server';
/**
 * @fileOverview An AI agent for answering user support questions about the app.
 *
 * - answerSupportQuestion - A function that answers questions based on a knowledge base.
 * - SupportBotInput - The input type for the answerSupportQuestion function.
 * - SupportBotOutput - The return type for the answerSupportQuestion function.
 */

import { supportBotFlow } from './flows/support-bot-flow';
import type { SupportBotInput, SupportBotOutput } from './schemas/support-bot.schemas';
export type { SupportBotInput, SupportBotOutput };

export async function answerSupportQuestion(input: SupportBotInput): Promise<SupportBotOutput> {
  const flow = await supportBotFlow;
  return flow(input);
}
