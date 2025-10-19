
'use server';

import { z } from 'zod';
import { authService } from '@/lib/authService';
import { dbService } from '@/lib/dbService';
import { storageService } from '@/lib/storageService';
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

async function generateStaffId(role: string, offset = 0): Promise<string> {
    const roleCode = ROLE_CODES[role] || 'GEN';
    const year = new Date().getFullYear().toString().slice(-2);

    const staffCountForRole = await dbService.getCountFromServer('users', [
        { type: 'where', fieldPath: 'role', opStr: '==', value: role }
    ]);
    const nextId = (staffCountForRole + offset + 1).toString().padStart(4, '0');

    return `GIIA${year}${roleCode}${nextId}`;
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

    const staffId = await generateStaffId(staffData.role);

    const authUser = await authService.createUser({
        email: staffData.email,
        password: staffData.stateOfOrigin, 
    });

    let profilePictureUrl = '';
    if (profilePicture) {
      const { downloadURL } = await storageService.uploadFile(
        `staff-photos/${authUser.uid}/${Date.now()}-${profilePicture.name}`,
        profilePicture
      );
      profilePictureUrl = downloadURL;
    }

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
        },
        salary: {
            amount: 0,
            bankName: null,
            accountNumber: null,
            accountName: null,
        }
    };
    
    await dbService.setDoc('users', authUser.uid, newStaffData);

    return { success: true };

  } catch (error: any) {
    console.error('Error creating staff:', error);
    if (error.code === 'auth/email-already-in-use') {
      return { error: 'This email is already registered.' };
    }
     if (error.code === 'auth/weak-password') {
      return { error: `The password is too weak. It must be at least 6 characters.` };
    }
    return { error: error.message || 'An unexpected server error occurred.' };
  }
}

export async function bulkCreateStaff(staffList: any[]) {
    try {
        const batch = dbService.createBatch();
        const validStaff: any[] = [];
        const invalidRecords: any[] = [];
        
        const requiredFields = ["firstName", "lastName", "email", "role", "phone", "stateOfOrigin"];

        for (let i = 0; i < staffList.length; i++) {
            const staff = staffList[i];
            const missingFields = requiredFields.filter(field => !staff[field]);
            
            if (missingFields.length > 0) {
                invalidRecords.push({ ...staff, error: `Missing required fields: ${missingFields.join(', ')}` });
                continue;
            }
             if (!z.string().email().safeParse(staff.email).success) {
                invalidRecords.push({ ...staff, error: 'Invalid email format.' });
                continue;
            }

            validStaff.push(staff);
        }
        
        for (let i = 0; i < validStaff.length; i++) {
            const staff = validStaff[i];
            const staffId = await generateStaffId(staff.role, i);
            
            const authUser = await authService.createUser({
                email: staff.email,
                password: staff.stateOfOrigin,
            });

            const newStaffData = {
                uid: authUser.uid,
                staffId,
                name: `${staff.firstName} ${staff.lastName}`,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                department: staff.department || 'N/A',
                stateOfOrigin: staff.stateOfOrigin,
                generatedPassword: staff.stateOfOrigin,
                status: 'active',
                createdAt: serverTimestamp(),
                employmentDate: staff['employmentDate(YYYY-MM-DD)'] ? new Date(staff['employmentDate(YYYY-MM-DD)']) : new Date(),
                personalInfo: {
                    address: staff.address || '',
                    gender: staff.gender || 'Other',
                    dob: staff['dateOfBirth(YYYY-MM-DD)'] ? new Date(staff['dateOfBirth(YYYY-MM-DD)']) : new Date(),
                    profilePicture: '',
                },
                salary: {
                    amount: 0,
                    bankName: null,
                    accountNumber: null,
                    accountName: null,
                }
            };
            
            batch.set('users', authUser.uid, newStaffData);
        }

        if (validStaff.length > 0) {
            await batch.commit();
        }

        return { 
            success: true, 
            importedCount: validStaff.length,
            errorCount: invalidRecords.length,
            invalidRecords: invalidRecords
        };

    } catch (error: any) {
        console.error('Error in bulk staff creation:', error);
         if (error.code === 'auth/email-already-in-use') {
          return { error: 'One or more email addresses are already in use.' };
        }
        return { error: error.message || 'An unexpected server error occurred during bulk import.' };
    }
}
