
'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { AppNotification } from './schema';

type NotificationPayload = {
    userId: string;
    title: string;
    body: string;
    type: AppNotification['type'];
    ref: {
        collection: string;
        id: string;
    };
};

/**
 * Creates a notification in Firestore for a user.
 * @param payload - The data for the notification.
 */
export async function createActionNotification(payload: NotificationPayload) {
  try {
    await addDoc(collection(db, 'notifications'), {
      toUserId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      ref: payload.ref,
      read: false,
      createdAt: serverTimestamp(),
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    // We don't re-throw here to avoid interrupting the main user-facing flow.
    // The primary action (e.g., approval) is more important than the notification itself.
  }
}
