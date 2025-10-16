'use server';
/**
 * @fileOverview An AI agent for drafting communications like announcements.
 *
 * - draftCommunication - A function that drafts text based on key points.
 * - DraftCommunicationInput - The input type for the draftCommunication function.
 * - DraftCommunicationOutput - The return type for the draftCommunication function.
 */

import { draftCommunicationFlow } from './flows/drafter-flow';
import type { DraftCommunicationInput, DraftCommunicationOutput } from './schemas/drafter.schemas';
export type { DraftCommunicationInput, DraftCommunicationOutput };


export async function draftCommunication(input: DraftCommunicationInput): Promise<DraftCommunicationOutput> {
  const flow = await draftCommunicationFlow;
  return flow(input);
}
