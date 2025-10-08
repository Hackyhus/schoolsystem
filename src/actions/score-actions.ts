
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Score } from '@/lib/schema';

type BulkUpdatePayload = {
    scores: any[];
    class: string;
    subject: string;
};

export async function bulkUpdateScores(payload: BulkUpdatePayload) {
    const { scores, class: className, subject } = payload;

    if (!scores || scores.length === 0) {
        return { error: 'No score data provided.' };
    }

    try {
        const batch = writeBatch(db);
        let updatedCount = 0;

        // Get existing scores to perform updates instead of overwrites
        const studentIds = scores.map(s => s.studentId).filter(Boolean);
        
        // Ensure studentIds is not empty to avoid invalid 'in' query
        if (studentIds.length === 0) {
            return { success: true, updatedCount: 0 };
        }

        const scoresQuery = query(
            collection(db, 'scores'), 
            where('studentId', 'in', studentIds), 
            where('subject', '==', subject),
            where('class', '==', className)
        );
        const scoresSnapshot = await getDocs(scoresQuery);
        const existingScoresMap = new Map<string, {id: string, data: Score}>();
        scoresSnapshot.forEach(doc => {
            existingScoresMap.set(doc.data().studentId, { id: doc.id, data: doc.data() as Score });
        });

        for (const record of scores) {
            if (!record.studentId) continue;
            
            const caScore = Number(record.caScore);
            const examScore = Number(record.examScore);

            // Basic validation
            if (isNaN(caScore) || isNaN(examScore) || caScore < 0 || caScore > 40 || examScore < 0 || examScore > 60) {
                // For now, we skip invalid records. A more robust solution could return them as errors.
                continue;
            }

            const totalScore = caScore + examScore;
            const existing = existingScoresMap.get(record.studentId);

            const scoreData = {
                caScore,
                examScore,
                totalScore,
                status: 'Draft',
            };

            if (existing) {
                // Update existing score document
                const docRef = doc(db, 'scores', existing.id);
                batch.update(docRef, scoreData);
            } else {
                // Create new score document
                const docRef = doc(collection(db, 'scores'));
                const newScoreData = {
                    ...scoreData,
                    studentId: record.studentId,
                    subject,
                    class: className,
                    // In a real app, you'd get the teacherId from the session
                    teacherId: 'placeholder-teacher-id',
                };
                batch.set(docRef, newScoreData);
            }
            updatedCount++;
        }

        if (updatedCount > 0) {
            await batch.commit();
        }

        return { success: true, updatedCount };

    } catch (error: any) {
        console.error('Error in bulk score update:', error);
        return { error: error.message || 'An unexpected server error occurred during bulk import.' };
    }
}
