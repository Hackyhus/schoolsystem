'use server';

import { z } from 'zod';
import { authService, dbService, storageService } from '@/lib/firebase';
import { serverTimestamp } from 'firebase/firestore';

const staffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(['Male', 'Female', 'Other']),
  dateOfBirth: z.string(),
  stateOfOrigin: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  staffId: z.string().min(1),
  role: z.enum(['Admin', 'SLT', 'HeadOfDepartment', 'Teacher', 'Accountant', 'ExamOfficer']),
  department: z.string().min(1),
  dateOfEmployment: z.string(),
  profilePicture: z.instanceof(File).optional(),
  documents: z.array(z.instanceof(File)).optional(),
});


export async function createStaff(formData: FormData) {
  try {
    const documents = formData.getAll('documents[0]').filter(f => f instanceof File) as File[];

    const rawData = {
        ...Object.fromEntries(formData.entries()),
        profilePicture: formData.get('profilePicture') instanceof File ? formData.get('profilePicture') : undefined,
        documents: documents.length > 0 ? documents : undefined,
    };

    const parsed = staffSchema.safeParse(rawData);

    if (!parsed.success) {
        console.error('Zod Errors:', parsed.error.flatten().fieldErrors);
        return { error: 'Invalid form data provided.' };
    }
    
    const { profilePicture, documents: staffDocs, ...staffData } = parsed.data;

    // 1. Create user in Firebase Auth
    const authUser = await authService.createUser({
        email: staffData.email,
        password: staffData.stateOfOrigin, // Use state of origin as default password
    });

    // 2. Upload profile picture if it exists
    let profilePictureUrl = '';
    if (profilePicture) {
      const { downloadURL } = await storageService.uploadFile(
        `staff-photos/${authUser.uid}/${Date.now()}-${profilePicture.name}`,
        profilePicture
      );
      profilePictureUrl = downloadURL;
    }

    // 3. Create user document in Firestore
    const newStaffData = {
        uid: authUser.uid,
        staffId: staffData.staffId,
        name: `${staffData.firstName} ${staffData.lastName}`,
        email: staffData.email,
        phone: staffData.phone,
        role: staffData.role,
        department: staffData.department,
        stateOfOrigin: staffData.stateOfOrigin,
        generatedPassword: staffData.stateOfOrigin,
        status: 'active',
        createdAt: serverTimestamp(),
        employmentDate: new Date(staffData.dateOfEmployment),
        personalInfo: {
            address: staffData.address,
            gender: staffData.gender,
            dob: new Date(staffData.dateOfBirth),
            profilePicture: profilePictureUrl,
        }
    };
    
    await dbService.setDoc('users', authUser.uid, newStaffData);

    return { success: true };

  } catch (error: any) {
    console.error('Error creating staff:', error);
    // Handle specific Firebase auth errors
    if (error.code === 'auth/email-already-in-use') {
      return { error: 'This email is already registered.' };
    }
    if (error.code === 'auth/weak-password') {
        return { error: 'The default password (State of Origin) is too weak. Please choose a different state or handle this case.' };
    }
    return { error: error.message || 'An unexpected server error occurred.' };
  }
}
