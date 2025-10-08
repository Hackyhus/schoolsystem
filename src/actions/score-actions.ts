
'use server';

import { db, dbService } from '@/lib/firebase';
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
            return { error: 'The uploaded file does not contain any valid student IDs.' };
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
        
        const teacherId = await dbService.getDocs<{teacherId: string}>('scores', [
            {type: 'where', fieldPath: 'class', opStr: '==', value: className},
            {type: 'where', fieldPath: 'subject', opStr: '==', value: subject},
            {type: 'limit', limitCount: 1}
        ]).then(res => res[0]?.teacherId || 'placeholder-teacher-id');

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

            const scoreData: Partial<Score> = {
                caScore,
                examScore,
                totalScore,
                status: 'Draft',
            };

            if (existing) {
                // Update existing score document
                const docRef = doc(db, 'scores', existing.id);
                // Only update, don't change status if it was already approved
                const updatePayload: Partial<Score> = {
                    caScore,
                    examScore,
                    totalScore,
                    status: existing.data.status === 'Approved' ? 'Approved' : 'Draft',
                }
                batch.update(docRef, updatePayload);
            } else {
                // Create new score document
                const docRef = doc(collection(db, 'scores'));
                const newScoreData: Omit<Score, 'id'> = {
                    ...scoreData,
                    studentId: record.studentId,
                    subject,
                    class: className,
                    // In a real app, you'd get the teacherId from the session
                    teacherId: teacherId,
                    term: 'First Term' // Placeholder
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
