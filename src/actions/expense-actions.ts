
'use server';

import { z } from 'zod';
import { dbService, auth } from '@/lib/firebase'; // Using auth directly now
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Expense, MockUser } from '@/lib/schema';
import { revalidatePath } from 'next/cache';

const EXPENSE_CATEGORIES = ['Utilities', 'Salaries', 'Maintenance', 'Supplies', 'Marketing', 'Capital Expenditure', 'Miscellaneous'] as const;

const expenseSchema = z.object({
  id: z.string().optional(),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  date: z.date({ required_error: 'Expense date is required.' }),
  department: z.string().optional(),
});


export async function saveExpense(values: z.infer<typeof expenseSchema>) {
  try {
    const parsed = expenseSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    // This is a protected action, so we can reliably get the user this way on the server.
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error("Authentication failed. You must be logged in to record an expense.");
    }
    
    const accountant = await dbService.getDoc<MockUser>('users', currentUser.uid);

    const { id, ...data } = parsed.data;

    const expenseData: Omit<Expense, 'id'> = {
      ...data,
      date: Timestamp.fromDate(data.date),
      amount: data.amount,
      recordedBy: currentUser.uid,
      recordedByName: accountant?.name || 'N/A',
      createdAt: serverTimestamp(),
    };

    if (id) {
      await dbService.updateDoc('expenses', id, expenseData);
    } else {
      await dbService.addDoc('expenses', expenseData);
    }

    revalidatePath('/dashboard/accountant/expenses'); // Revalidate the path
    return { success: true };

  } catch (error: any) {
    console.error('Error saving expense:', error);
    return { error: { _errors: [error.message || 'An unexpected error occurred.'] } };
  }
}

export async function deleteExpense(id: string) {
  try {
    await dbService.deleteDoc('expenses', id);
    revalidatePath('/dashboard/accountant/expenses'); // Revalidate on delete too
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return { error: 'An unexpected error occurred while deleting.' };
  }
}
