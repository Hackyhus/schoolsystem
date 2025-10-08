'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Creates a notification in Firestore for a user regarding a score update.
 * @param teacherId - The UID of the user to notify.
 * @param scoreId - The ID of the score document.
 * @param studentName - The name of the student.
 * @param subject - The subject of the score.
 * @param action - The action taken ('Approved' or 'Rejected').
 */
export async function createScoreNotification(
  teacherId: string,
  scoreId: string,
  studentName: string,
  subject: string,
  action: 'Approved' | 'Rejected'
) {
  try {
    const type = action === 'Approved' ? 'APPROVAL' : 'REJECTION';
    const body = `Your score submission for ${studentName} in ${subject} has been ${action.toLowerCase()}.`;

    await addDoc(collection(db, 'notifications'), {
      toUserId: teacherId,
      type: type,
      title: `Score ${action}`,
      body: body,
      ref: {
        collection: 'scores',
        id: scoreId,
      },
      read: false,
      createdAt: serverTimestamp(),
    });

  } catch (error) {
    console.error('Error creating score notification:', error);
    // We don't throw here to not interrupt the main flow.
  }
}
