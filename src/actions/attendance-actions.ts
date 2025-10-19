
'use server';

import { z } from 'zod';
import { dbService } from '@/lib/firebase';
import { serverTimestamp, Timestamp } from 'firebase/firestore';

const attendanceRecordSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  status: z.enum(['Present', 'Absent', 'Late']),
});

const attendanceSheetSchema = z.object({
  date: z.date(),
  className: z.string(),
  records: z.array(attendanceRecordSchema),
});

export async function saveAttendance(values: z.infer<typeof attendanceSheetSchema>) {
  try {
    const parsed = attendanceSheetSchema.safeParse(values);
    if (!parsed.success) {
      return { error: 'Invalid data provided.' };
    }

    const { date, className, records } = parsed.data;
    
    // Use YYYY-MM-DD format for the document ID to ensure idempotency for a given day
    const docId = `${className}-${date.toISOString().split('T')[0]}`;
    
    const attendanceData = {
      date: Timestamp.fromDate(date),
      className,
      records,
      lastUpdated: serverTimestamp(),
    };

    // Use setDoc with the deterministic ID to either create a new document or overwrite an existing one for the same day.
    await dbService.setDoc('attendance', docId, attendanceData);

    return { success: true };

  } catch (error: any) {
    console.error('Error saving attendance:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
