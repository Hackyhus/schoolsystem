
'use server';

import { dbService } from "@/lib/dbService";
import { createActionNotification } from "@/lib/notifications";

export async function assignHod(departmentId: string, newHodId: string | null) {
    try {
        const batch = dbService.createBatch();
        const dept = await dbService.getDoc<{ name: string }>('departments', departmentId);
        if (!dept) throw new Error('Department not found.');

        // If 'remove' is passed, it means we are un-assigning the HOD
        if (newHodId === 'remove' || newHodId === null) {
            batch.update('departments', departmentId, { hodId: null });
        } else {
            batch.update('departments', departmentId, { hodId: newHodId });
            batch.update('users', newHodId, { role: 'HeadOfDepartment', department: dept.name });
            
            await createActionNotification({
                userId: newHodId,
                title: 'New Responsibility Assigned',
                body: `You have been assigned as the Head of Department for the ${dept.name} department.`,
                type: 'INFO',
                ref: { collection: 'departments', id: departmentId }
            });
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

        await createActionNotification({
            userId: teacherId,
            title: 'Department Assigned',
            body: `You have been assigned to the ${departmentName} department.`,
            type: 'INFO',
            ref: { collection: 'users', id: teacherId }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error assigning teacher department:", error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}
