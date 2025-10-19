
'use server';

import { z } from 'zod';
import { dbService } from '@/lib/dbService';
import { serverTimestamp } from 'firebase/firestore';
import type { FeeStructure } from '@/lib/schema';
import { revalidatePath } from 'next/cache';

const feeItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  amount: z.coerce.number().min(0, 'Amount must be a positive number.'),
});

const feeStructureSchema = z.object({
  id: z.string().optional(),
  className: z.string().min(1, 'Class is required.'),
  session: z.string().min(1, 'Session is required.'),
  term: z.string().min(1, 'Term is required.'),
  items: z.array(feeItemSchema).min(1, 'At least one fee item is required.'),
});

export async function saveFeeStructure(values: z.infer<typeof feeStructureSchema>) {
  try {
    const parsed = feeStructureSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { id, items, ...rest } = parsed.data;
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    const data: Omit<FeeStructure, 'id'> = {
      ...rest,
      items,
      totalAmount,
      createdAt: serverTimestamp(),
    };

    if (id) {
      await dbService.updateDoc('feeStructures', id, data);
    } else {
      await dbService.addDoc('feeStructures', data);
    }

    revalidatePath('/dashboard/accountant/fees');
    return { success: true };

  } catch (error: any) {
    console.error('Error saving fee structure:', error);
    return { error: { _errors: [error.message || 'An unexpected error occurred.'] } };
  }
}

export async function deleteFeeStructure(id: string) {
  try {
    await dbService.deleteDoc('feeStructures', id);
    revalidatePath('/dashboard/accountant/fees');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting fee structure:', error);
    return { error: 'An unexpected error occurred while deleting.' };
  }
}
