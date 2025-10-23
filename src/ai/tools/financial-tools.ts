'use server';

import { ai } from '@/lib/genkit';
import { dbService } from '@/lib/dbService';
import { z } from 'zod';
import type { Invoice, Student } from '@/lib/schema';

const FindStudentInvoiceInputSchema = z.object({
  studentName: z.string().describe("The full name of the student to search for, e.g., 'Amina Sani'."),
});

/**
 * A tool that finds the most recent unpaid invoice for a student.
 */
export const findStudentInvoiceTool = ai.defineTool(
  {
    name: 'findStudentInvoice',
    description: "Finds a student's most recent unpaid or partially paid invoice by their full name.",
    inputSchema: FindStudentInvoiceInputSchema,
    outputSchema: z.string().nullable().describe("The invoice ID (e.g., 'INV-2024-00123') or null if no matching invoice is found."),
  },
  async ({ studentName }) => {
    try {
      // Find the student by name first to get their official student ID.
      // This is a simplified search. A real-world app might need more sophisticated matching.
      const studentQuery = await dbService.getDocs<Student>('students', [
        { type: 'where', fieldPath: 'firstName', opStr: '==', value: studentName.split(' ')[0] },
        { type: 'where', fieldPath: 'lastName', opStr: '==', value: studentName.split(' ')[1] },
        { type: 'limit', limitCount: 1 }
      ]);
      
      const student = studentQuery[0];
      if (!student) {
        return null;
      }

      // Now find the most recent unpaid/partially-paid invoice for that student
      const invoiceQuery = await dbService.getDocs<Invoice>('invoices', [
        { type: 'where', fieldPath: 'studentId', opStr: '==', value: student.studentId },
        { type: 'where', fieldPath: 'status', opStr: 'in', value: ['Unpaid', 'Partially Paid'] },
        { type: 'orderBy', fieldPath: 'createdAt', direction: 'desc'},
        { type: 'limit', limitCount: 1 }
      ]);
      
      const invoice = invoiceQuery[0];
      return invoice?.invoiceId || null;

    } catch (error) {
      console.error('Error finding student invoice:', error);
      // Return null to the AI in case of an error
      return null;
    }
  }
);
