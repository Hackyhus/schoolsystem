'use server';
/**
 * @fileOverview An AI agent for creating narrative summaries from structured data.
 *
 * - narrateData - A function that analyzes structured data and provides a summary.
 * - NarrateDataInput - The input type for the narrateData function.
 * - NarrateDataOutput - The return type for the narrateData function.
 */

import { narrateDataFlow } from './flows/narrate-data-flow';
import type { NarrateDataInput, NarrateDataOutput } from './schemas/narrator.schemas';
export type { NarrateDataInput, NarrateDataOutput };


export async function narrateData(input: NarrateDataInput): Promise<NarrateDataOutput> {
  const flow = await narrateDataFlow;
  return flow(input);
}
