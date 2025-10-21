
'use server';

import { dbService } from '@/lib/dbService';
import { storageService } from '@/lib/storageService';
import { serverTimestamp } from 'firebase/firestore';
import type { MockUser } from '@/lib/schema';

type FileMetadata = {
  name: string;
  title: string;
  type: 'Lesson Plan' | 'Exam Question' | 'Test Question';
  class: string;
  subject: string;
};

export async function bulkUploadDocuments(formData: FormData) {
  const userId = formData.get('userId') as string;
  const metadataString = formData.get('metadata') as string;

  if (!userId || !metadataString) {
    return { error: 'User ID and metadata are required.' };
  }

  try {
    const userDoc = await dbService.getDoc<MockUser>('users', userId);
    if (!userDoc) {
      return { error: 'User not found.' };
    }

    const metadata: FileMetadata[] = JSON.parse(metadataString);
    const batch = dbService.createBatch();
    let successCount = 0;

    for (let i = 0; i < metadata.length; i++) {
      const meta = metadata[i];
      const file = formData.get(`file_${i}`) as File | null;

      if (!file) continue;

      let collectionName = 'lessonNotes';
      let status = 'Pending HOD Approval';
      let reviewer = 'HeadOfDepartment';

      if (meta.type === 'Exam Question') {
        collectionName = 'examQuestions';
        status = 'Pending Review';
        reviewer = 'Exam Officer';
      } else if (meta.type === 'Test Question') {
        collectionName = 'testQuestions';
        status = 'Pending Review';
        reviewer = 'Exam Officer';
      }

      const { downloadURL, storagePath } = await storageService.uploadFile(
        `${collectionName}/${userId}/${Date.now()}-${file.name}`,
        file
      );

      const newDocData = {
        title: meta.title,
        class: meta.class,
        subject: meta.subject,
        fileUrl: downloadURL,
        storagePath: storagePath,
        teacherId: userId,
        teacherName: userDoc.name || 'Unknown Teacher',
        status: status,
        submissionDate: new Date().toLocaleDateString('en-CA'),
        submittedOn: serverTimestamp(),
        reviewer: reviewer,
        type: meta.type,
      };

      batch.set(collectionName, null, newDocData);
      successCount++;
    }

    await batch.commit();

    return { success: true, successCount };

  } catch (error: any) {
    console.error('Error during bulk upload:', error);
    return { error: error.message || 'An unexpected error occurred during the upload process.' };
  }
}
