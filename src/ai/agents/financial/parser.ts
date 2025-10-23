'use server';
/**
 * @fileOverview An AI agent for parsing structured data from text.
 *
 * - parseStudentNameFromTransaction - A function that extracts a student's name from a transaction description.
 * - ParseStudentNameInput - The input type for the parseStudentNameFromTransaction function.
 * - ParseStudentNameOutput - The return type for the parseStudentNameFromTransaction function.
 */

import { parseStudentNameFlow } from './flows/parser-flow';
import type { ParseStudentNameInput, ParseStudentNameOutput } from './schemas/parser.schemas';
export type { ParseStudentNameInput, ParseStudentNameOutput };

export async function parseStudentNameFromTransaction(input: ParseStudentNameInput): Promise<ParseStudentNameOutput> {
  const flow = await parseStudentNameFlow;
  return flow(input);
}
