/**
 * @fileOverview The central export for the InsightConnect AI Engine.
 * This file consolidates all AI agents into a single, easy-to-use object,
 * providing a unified interface for accessing AI capabilities throughout the application.
 */

import { summarizeText } from './agents/text/summarizer';
import { draftCommunication } from './agents/text/drafter';
import { analyzeFinancials } from './agents/financial/analyst';
import { categorizeExpense } from './agents/financial/categorizer';
import { generatePerformanceComment } from './agents/academic/performance-comment-generator';
import { narrateData } from './agents/academic/narrator';
import { answerSupportQuestion } from './agents/support/support-bot';

export const aiEngine = {
  text: {
    summarize: summarizeText,
    draft: draftCommunication,
  },
  financial: {
    analyze: analyzeFinancials,
    categorize: categorizeExpense,
  },
  academic: {
    generateComment: generatePerformanceComment,
    narrate: narrateData,
  },
  support: {
    answer: answerSupportQuestion,
  },
  // Future AI categories will be added here.
};
