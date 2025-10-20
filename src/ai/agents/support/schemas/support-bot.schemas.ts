
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'bot']),
  content: z.string(),
});

export const SupportBotInputSchema = z.object({
  question: z.string().describe('The user\'s latest question.'),
  role: z.string().describe('The role of the user asking the question (e.g., "Admin", "Teacher").'),
  history: z.array(MessageSchema).describe('The recent conversation history between the user and the bot.'),
});
export type SupportBotInput = z.infer<typeof SupportBotInputSchema>;


export const SupportBotOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type SupportBotOutput = z.infer<typeof SupportBotOutputSchema>;
