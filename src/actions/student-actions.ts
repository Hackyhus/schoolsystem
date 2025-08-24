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
  admissionNumber: z.string().min(1),
  class: z.string().min(1),
  admissionDate: z.string(),
  session: z.string().min(1),
  medicalConditions: z.string().optional(),
  profilePicture: z.instanceof(File).optional(),
  documents: z.array(z.instanceof(File)).optional(),
});

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

    let profilePictureUrl = '';
    if (profilePicture) {
      const { downloadURL } = await storageService.uploadFile(
        `student-photos/${Date.now()}-${profilePicture.name}`,
        profilePicture
      );
      profilePictureUrl = downloadURL;
    }
    
    let uploadedDocuments: { documentType: string, fileUrl: string, storagePath: string }[] = [];
    if (studentDocs && studentDocs.length > 0) {
        uploadedDocuments = await Promise.all(
            studentDocs.map(async (doc) => {
                const { downloadURL, storagePath } = await storageService.uploadFile(
                    `student-documents/${studentData.admissionNumber}/${Date.now()}-${doc.name}`,
                    doc
                );
                return { documentType: doc.name.split('.').slice(0, -1).join('.'), fileUrl: downloadURL, storagePath };
            })
        );
    }

    const newStudent: Omit<Student, 'id' | 'createdAt' | 'status'> & { createdAt: any, status: string } = {
        studentId: studentData.admissionNumber,
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
