
'use server';

import { dbService } from "@/lib/dbService";

export async function assignHod(departmentId: string, newHodId: string | null) {
    try {
        const batch = dbService.createBatch();

        // If 'remove' is passed, it means we are un-assigning the HOD
        if (newHodId === 'remove' || newHodId === null) {
            batch.update('departments', departmentId, { hodId: null });
        } else {
            batch.update('departments', departmentId, { hodId: newHodId });

            // Optional: Also update the user's role to HOD if they are not already
            const dept = await dbService.getDoc<{ name: string }>('departments', departmentId);
            if (dept) {
                batch.update('users', newHodId, { role: 'HeadOfDepartment', department: dept.name });
            }
        }
        
        await batch.commit();
        return { success: true };

    } catch (error: any) {
        console.error("Error assigning HOD:", error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}

export async function assignTeacherDepartment(teacherId: string, departmentName: string) {
    try {
        await dbService.updateDoc('users', teacherId, { department: departmentName });
        return { success: true };
    } catch (error: any) {
        console.error("Error assigning teacher department:", error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}
