
'use server';

import { ai } from '@/lib/genkit';
import { z } from 'zod';
import {
  format,
  addDays,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
} from 'date-fns';

const DateToolInputSchema = z.object({
  description: z.string().describe(
    'A natural language description of the date to calculate, relative to today. ' +
    'Examples: "today", "tomorrow", "next Monday", "3 days from now", "Wednesday next week".'
  ),
});

export const getDateTool = ai.defineTool(
  {
    name: 'getDate',
    description: 'Calculates a future date based on a natural language description and returns it as a formatted string (e.g., "October 28, 2024").',
    inputSchema: DateToolInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const today = new Date();
    const description = input.description.toLowerCase();

    let calculatedDate: Date;

    const daysFromNowMatch = description.match(/(\d+)\s+days?\s+from\s+now/);

    if (description.includes('today')) {
      calculatedDate = today;
    } else if (description.includes('tomorrow')) {
      calculatedDate = addDays(today, 1);
    } else if (daysFromNowMatch) {
      const days = parseInt(daysFromNowMatch[1], 10);
      calculatedDate = addDays(today, days);
    } else if (description.includes('next monday')) {
      calculatedDate = nextMonday(today);
    } else if (description.includes('next tuesday')) {
      calculatedDate = nextTuesday(today);
    } else if (description.includes('next wednesday')) {
      calculatedDate = nextWednesday(today);
    } else if (description.includes('next thursday')) {
      calculatedDate = nextThursday(today);
    } else if (description.includes('next friday')) {
      calculatedDate = nextFriday(today);
    } else if (description.includes('next saturday')) {
      calculatedDate = nextSaturday(today);
    } else if (description.includes('next sunday')) {
      calculatedDate = nextSunday(today);
    } else {
      // Fallback for simple day names like "wednesday"
      const dayMap: { [key: string]: (date: Date) => Date } = {
        monday: nextMonday,
        tuesday: nextTuesday,
        wednesday: nextWednesday,
        thursday: nextThursday,
        friday: nextFriday,
        saturday: nextSaturday,
        sunday: nextSunday,
      };
      const dayWord = description.split(' ')[0];
      const dayFunc = dayMap[dayWord];
      if (dayFunc) {
        calculatedDate = dayFunc(today);
      } else {
        // If no specific date can be calculated, return a placeholder
        return `[Could not calculate date for: "${input.description}"]`;
      }
    }

    return format(calculatedDate, 'MMMM d, yyyy');
  }
);
