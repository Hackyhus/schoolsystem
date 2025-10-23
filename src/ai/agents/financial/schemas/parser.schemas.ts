import { z } from 'zod';

export const ParseStudentNameInputSchema = z.object({
  description: z.string().describe('The bank transaction description, e.g., "NIBSS/SCHOOL FEES-IBRAHIM LAWAL/PSSP".'),
});
export type ParseStudentNameInput = z.infer<typeof ParseStudentNameInputSchema>;

export const ParseStudentNameOutputSchema = z.object({
  studentName: z.string().nullable().describe('The extracted student name (e.g., "Ibrahim Lawal") or null if no name is found.'),
});
export type ParseStudentNameOutput = z.infer<typeof ParseStudentNameOutputSchema>;
