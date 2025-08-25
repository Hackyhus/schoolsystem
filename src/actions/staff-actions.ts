
'use server';

import { z } from 'zod';
import { authService, dbService, storageService } from '@/lib/firebase';
import { serverTimestamp } from 'firebase/firestore';

const staffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  dateOfBirth: z.string(),
  stateOfOrigin: z.string().min(1, 'State of Origin is required and will be the default password.'),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  role: z.enum(['Admin', 'SLT', 'HeadOfDepartment', 'Teacher', 'Accountant', 'ExamOfficer']),
  department: z.string().optional(),
  dateOfEmployment: z.string(),
  profilePicture: z.instanceof(File).optional(),
  documents: z.array(z.instanceof(File)).optional(),
}).refine(data => {
    if (['HeadOfDepartment', 'Teacher'].includes(data.role)) {
      return !!data.department && data.department.length > 0;
    }
    return true;
  }, {
    message: "Department is required for this role.",
    path: ["department"],
  });

const ROLE_CODES: { [key: string]: string } = {
    Admin: 'ADM',
    SLT: 'SLT',
    HeadOfDepartment: 'HOD',
    Teacher: 'TEA',
    Accountant: 'ACC',
    ExamOfficer: 'EXO',
};

async function generateStaffId(role: string): Promise<string> {
    const roleCode = ROLE_CODES[role] || 'GEN';
    const year = new Date().getFullYear().toString().slice(-2);

    // Get the count of existing staff to determine the next sequential number.
    const staffCount = await dbService.getCountFromServer('users', [{ type: 'where', fieldPath: 'staffId', opStr: '!=', value: null }]);
    const nextId = (staffCount + 1).toString().padStart(3, '0');

    return `GIIA/${roleCode}/${year}/${nextId}`;
}


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
        return { error: 'Invalid form data provided. ' + parsed.error.flatten().formErrors.join(', ') };
    }
    
    const { profilePicture, documents: staffDocs, ...staffData } = parsed.data;

    // 1. Generate Staff ID
    const staffId = await generateStaffId(staffData.role);

    // 2. Create user in Firebase Auth
    // Use state of origin as default password, regardless of length.
    const authUser = await authService.createUser({
        email: staffData.email,
        password: staffData.stateOfOrigin, 
    });

    // 3. Upload profile picture if it exists
    let profilePictureUrl = '';
    if (profilePicture) {
      const { downloadURL } = await storageService.uploadFile(
        `staff-photos/${authUser.uid}/${Date.now()}-${profilePicture.name}`,
        profilePicture
      );
      profilePictureUrl = downloadURL;
    }

    // 4. Create user document in Firestore
    const newStaffData = {
        uid: authUser.uid,
        staffId: staffId,
        name: `${staffData.firstName} ${staffData.lastName}`,
        email: staffData.email,
        phone: staffData.phone,
        role: staffData.role,
        department: staffData.department || 'N/A',
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
      return { error: 'The password is too weak. Firebase requires at least 6 characters.' };
    }
    return { error: error.message || 'An unexpected server error occurred.' };
  }
}
