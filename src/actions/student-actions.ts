
'use server';

import { z } from 'zod';
import { dbService, storageService } from '@/lib/firebase';
import { Student } from '@/lib/schema';
import { serverTimestamp } from 'firebase/firestore';

const studentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  dateOfBirth: z.string(),
  address: z.string().min(1),
  guardianName: z.string().min(1),
  guardianContact: z.string().min(1),
  guardianEmail: z.string().email(),
  class: z.string().min(1),
  admissionDate: z.string(),
  session: z.string().min(1),
  medicalConditions: z.string().optional(),
  profilePicture: z.instanceof(File).optional(),
  documents: z.array(z.instanceof(File)).optional(),
});

async function generateStudentId(offset = 0): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);

    // Get the count of existing students to determine the next sequential number.
    const studentCount = await dbService.getCountFromServer('students');
    const nextId = (studentCount + offset + 1).toString().padStart(4, '0');

    return `GIIA/STU/${year}/${nextId}`;
}


export async function createStudent(formData: FormData) {
  try {
    const documents = formData.getAll('documents[0]').filter(f => f instanceof File) as File[];

    const rawData = {
        ...Object.fromEntries(formData.entries()),
        profilePicture: formData.get('profilePicture') instanceof File ? formData.get('profilePicture') : undefined,
        documents: documents.length > 0 ? documents : undefined,
    };

    const parsed = studentSchema.safeParse(rawData);

    if (!parsed.success) {
      console.error(parsed.error);
      return { error: 'Invalid form data. ' + parsed.error.flatten().fieldErrors };
    }

    const { profilePicture, documents: studentDocs, ...studentData } = parsed.data;

    // 1. Generate Student ID
    const studentId = await generateStudentId();

    let profilePictureUrl = '';
    if (profilePicture) {
      const { downloadURL } = await storageService.uploadFile(
        `student-photos/${studentId.replace(/\//g, '-')}/${Date.now()}-${profilePicture.name}`,
        profilePicture
      );
      profilePictureUrl = downloadURL;
    }
    
    let uploadedDocuments: { documentType: string, fileUrl: string, storagePath: string }[] = [];
    if (studentDocs && studentDocs.length > 0) {
        uploadedDocuments = await Promise.all(
            studentDocs.map(async (doc) => {
                const { downloadURL, storagePath } = await storageService.uploadFile(
                    `student-documents/${studentId.replace(/\//g, '-')}/${Date.now()}-${doc.name}`,
                    doc
                );
                return { documentType: doc.name.split('.').slice(0, -1).join('.'), fileUrl: downloadURL, storagePath };
            })
        );
    }

    const newStudent: Omit<Student, 'id' | 'createdAt' | 'status'> & { createdAt: any, status: string } = {
        studentId: studentId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        middleName: studentData.middleName,
        gender: studentData.gender,
        dateOfBirth: new Date(studentData.dateOfBirth),
        classLevel: studentData.class,
        sessionYear: studentData.session,
        profilePicture: profilePictureUrl,
        guardians: [{
            fullName: studentData.guardianName,
            relationship: 'Parent/Guardian',
            phone: studentData.guardianContact,
            email: studentData.guardianEmail,
            address: studentData.address,
            isPrimary: true,
        }],
        contacts: [{
             emergencyContactName: studentData.guardianName,
             emergencyContactPhone: studentData.guardianContact,
             relationToStudent: 'Parent/Guardian'
        }],
        documents: uploadedDocuments,
        health: { medicalConditions: studentData.medicalConditions },
        admissionDate: new Date(studentData.admissionDate),
        createdAt: serverTimestamp(),
        status: 'Active',
    };
    
    await dbService.addDoc('students', newStudent);

    return { success: true };
  } catch (error: any) {
    console.error('Error creating student:', error);
    return { error: error.message || 'An unexpected server error occurred.' };
  }
}

export async function bulkCreateStudents(students: any[]) {
    try {
        const batch = dbService.createBatch();
        const validStudents: any[] = [];
        const invalidRecords: any[] = [];
        
        const requiredFields = ["firstName", "lastName", "class", "guardianName", "guardianContact"];

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const missingFields = requiredFields.filter(field => !student[field]);
            
            if (missingFields.length > 0) {
                invalidRecords.push({ ...student, error: `Missing required fields: ${missingFields.join(', ')}` });
                continue;
            }

            validStudents.push(student);
        }
        
        for (let i = 0; i < validStudents.length; i++) {
            const student = validStudents[i];
            const studentId = await generateStudentId(i);
            
            const newStudent: Omit<Student, 'id' | 'createdAt' | 'status'> & { createdAt: any; status: string } = {
                studentId: studentId,
                firstName: student.firstName,
                lastName: student.lastName,
                middleName: student.middleName || '',
                gender: student.gender || 'Other',
                dateOfBirth: student['dateOfBirth(YYYY-MM-DD)'] ? new Date(student['dateOfBirth(YYYY-MM-DD)']) : new Date(),
                classLevel: student.class,
                sessionYear: student['session(YYYY/YYYY)'] || '',
                profilePicture: '',
                guardians: [{
                    fullName: student.guardianName,
                    relationship: 'Parent/Guardian',
                    phone: student.guardianContact,
                    email: student.guardianEmail || '',
                    address: student.address || '',
                    isPrimary: true,
                }],
                contacts: [{
                    emergencyContactName: student.guardianName,
                    emergencyContactPhone: student.guardianContact,
                    relationToStudent: 'Parent/Guardian'
                }],
                documents: [],
                health: { medicalConditions: student.medicalConditions || 'N/A' },
                admissionDate: student['admissionDate(YYYY-MM-DD)'] ? new Date(student['admissionDate(YYYY-MM-DD)']) : new Date(),
                createdAt: serverTimestamp(),
                status: 'Active',
            };
            
            // Let Firestore generate the ID, and store our generated studentId as a field.
            batch.set('students', null, newStudent);
        }

        if (validStudents.length > 0) {
            await batch.commit();
        }

        return { 
            success: true, 
            importedCount: validStudents.length,
            errorCount: invalidRecords.length,
            invalidRecords: invalidRecords
        };

    } catch (error: any) {
        console.error('Error in bulk student creation:', error);
        return { error: error.message || 'An unexpected server error occurred during bulk import.' };
    }
}

export async function bulkDeleteStudents(studentIds: string[]) {
    if (!studentIds || studentIds.length === 0) {
        return { error: 'No student IDs provided for deletion.' };
    }

    try {
        const batch = dbService.createBatch();
        studentIds.forEach(id => {
            batch.delete('students', id);
        });
        await batch.commit();
        return { success: true, deletedCount: studentIds.length };
    } catch (error: any) {
        console.error('Error in bulk student deletion:', error);
        return { error: error.message || 'An unexpected server error occurred during bulk deletion.' };
    }
}
