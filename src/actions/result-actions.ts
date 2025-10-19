
'use server';

import { dbService } from '@/lib/dbService';
import { serverTimestamp } from 'firebase/firestore';
import type { Student, Score, ReportCard } from '@/lib/schema';

type Grade = {
  grade: string;
  minScore: number;
  maxScore: number;
};

export async function generateResultsForClass(className: string, session: string, term: string) {
    try {
        // 1. Fetch all students for the given class
        const students = await dbService.getDocs<Student>('students', [{ type: 'where', fieldPath: 'classLevel', opStr: '==', value: className }]);
        if (students.length === 0) {
            return { error: `No students found in ${className}.` };
        }
        const studentIds = students.map(s => s.studentId);
        
        // 2. Fetch all subjects offered in the school
        const subjects = await dbService.getDocs<{name: string}>('subjects');
        if (subjects.length === 0) {
            return { error: 'No subjects found in the system. Please configure subjects first.' };
        }

        // 3. Fetch all scores for these students for the given term and session
        const allScores = await dbService.getDocs<Score>('scores', [
            { type: 'where', fieldPath: 'class', opStr: '==', value: className },
            { type: 'where', fieldPath: 'studentId', opStr: 'in', value: studentIds }
        ]);

        // 4. Validate that all scores are 'Approved'
        const scoresByStudent: Record<string, Score[]> = {};
        for (const score of allScores) {
            if (!scoresByStudent[score.studentId]) {
                scoresByStudent[score.studentId] = [];
            }
            scoresByStudent[score.studentId].push(score);
        }

        for (const student of students) {
            const studentScores = scoresByStudent[student.studentId] || [];
            if (studentScores.length < subjects.length) {
                return { error: `Student ${student.firstName} ${student.lastName} is missing scores for one or more subjects.` };
            }
            const unapprovedScore = studentScores.find(s => s.status !== 'Approved');
            if (unapprovedScore) {
                return { error: `Student ${student.firstName} ${student.lastName} has an unapproved score for ${unapprovedScore.subject}. All scores must be approved.` };
            }
        }

        // 5. Fetch grading scale
        const gradingScaleDoc = await dbService.getDoc<{ scale: Grade[] }>('system', 'gradingScale');
        if (!gradingScaleDoc) {
             return { error: 'Grading scale is not configured. Please set it up in System > Grading.' };
        }
        const gradingScale: Grade[] = gradingScaleDoc.scale;

        const getGrade = (score: number): string => {
            const grade = gradingScale.find(g => score >= g.minScore && score <= g.maxScore);
            return grade?.grade || 'N/A';
        }

        // 6. Process results for each student
        const studentAverages: { studentId: string; average: number }[] = [];
        const reportCards: Omit<ReportCard, 'id' | 'classRank'>[] = [];
        
        for (const student of students) {
            const studentScores = scoresByStudent[student.studentId];
            let totalMarks = 0;
            const subjectResults = studentScores.map(score => {
                totalMarks += score.totalScore;
                return {
                    name: score.subject,
                    caScore: score.caScore,
                    examScore: score.examScore,
                    totalScore: score.totalScore,
                    grade: getGrade(score.totalScore),
                };
            });
            
            const average = totalMarks / subjects.length;
            studentAverages.push({ studentId: student.studentId, average });

            reportCards.push({
                studentId: student.studentId,
                studentName: `${student.firstName} ${student.lastName}`,
                class: className,
                term,
                session,
                generatedAt: serverTimestamp(),
                subjects: subjectResults,
                totalMarks,
                average,
                overallGrade: getGrade(average),
            });
        }

        // 7. Calculate Ranks
        studentAverages.sort((a, b) => b.average - a.average);
        const finalReportCards: Omit<ReportCard, 'id'>[] = reportCards.map(rc => {
            const rank = studentAverages.findIndex(sa => sa.studentId === rc.studentId) + 1;
            return { ...rc, classRank: rank };
        });

        // 8. Save report cards to Firestore using a batch write
        const batch = dbService.createBatch();
        finalReportCards.forEach(rc => {
            batch.set('reportCards', null, rc);
        });
        
        await batch.commit();

        return { success: true, generatedCount: finalReportCards.length, class: className };

    } catch (error: any) {
        console.error('Error generating results:', error);
        return { error: error.message || 'An unexpected error occurred during result generation.' };
    }
}
