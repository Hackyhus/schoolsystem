
'use server';

import { z } from 'zod';
import { dbService } from '@/lib/dbService';
import { serverTimestamp } from 'firebase/firestore';
import type { MockUser } from '@/lib/schema';
import { revalidatePath } from 'next/cache';

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  authorId: z.string(),
});

export async function saveAnnouncement(values: z.infer<typeof announcementSchema>) {
  try {
    const parsed = announcementSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors };
    }

    const { id, authorId, ...data } = parsed.data;

    if (!authorId) {
        throw new Error("Authentication failed. You must be logged in to manage announcements.");
    }

    const author = await dbService.getDoc<MockUser>('users', authorId);
    if (!author || !['Admin', 'SLT'].includes(author.role)) {
        throw new Error("You do not have permission to manage announcements.");
    }
    
    if (id) {
        // Update existing announcement
        const announcementData = {
            ...data,
            updatedAt: serverTimestamp(),
        };
        await dbService.updateDoc('announcements', id, announcementData);
    } else {
        // Create new announcement
        const announcementData = {
          ...data,
          authorId,
          authorName: author.name,
          createdAt: serverTimestamp(),
        };
        await dbService.addDoc('announcements', announcementData);
    }


    revalidatePath('/dashboard/announcements');
    return { success: true };

  } catch (error: any) {
    console.error('Error saving announcement:', error);
    return { error: { _errors: [error.message || 'An unexpected error occurred.'] } };
  }
}

export async function deleteAnnouncement(id: string) {
    try {
        await dbService.deleteDoc('announcements', id);
        revalidatePath('/dashboard/announcements');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting announcement:', error);
        return { error: 'An unexpected error occurred while deleting the announcement.' };
    }
}
