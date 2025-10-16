/**
 * @fileOverview The central export for the InsightConnect AI Engine.
 * This file consolidates all AI agents into a single, easy-to-use object,
 * providing a unified interface for accessing AI capabilities throughout the application.
 */

import { summarizeText } from './agents/text/summarizer';

export const aiEngine = {
  text: {
    summarize: summarizeText,
  },
  // Future AI categories (e.g., financial, generation) will be added here.
};
