
'use server';

import { dbService } from '@/lib/dbService';
import { serverTimestamp } from 'firebase/firestore';
import type { MockUser, PayrollRun, Payslip } from '@/lib/schema';
import { revalidatePath } from 'next/cache';

export async function runPayroll(month: string, year: number, userId: string) {
    try {
        // 1. Authenticate the user (must be an accountant or admin)
        if (!userId) {
            throw new Error("Authentication failed. You must be logged in.");
        }
        const userDoc = await dbService.getDoc<MockUser>('users', userId);
        if (!userDoc || !['Accountant', 'Admin'].includes(userDoc.role)) {
            throw new Error("You do not have permission to run payroll.");
        }
        
        // 2. Check if payroll for this month/year has already been run
        const existingRuns = await dbService.getDocs('payrollRuns', [
            { type: 'where', fieldPath: 'month', opStr: '==', value: month },
            { type: 'where', fieldPath: 'year', opStr: '==', value: year },
        ]);
        if (existingRuns.length > 0) {
            throw new Error(`Payroll for ${month} ${year} has already been executed.`);
        }

        // 3. Fetch all staff with a configured salary > 0
        const staff = await dbService.getDocs<MockUser>('users', [
            { type: 'where', fieldPath: 'salary.amount', opStr: '>', value: 0 },
            { type: 'where', fieldPath: 'status', opStr: '==', value: 'active' },
        ]);

        if (staff.length === 0) {
            return { error: 'No staff members with a configured salary greater than zero found.' };
        }

        // 4. Start a batch write
        const batch = dbService.createBatch();
        let totalPayrollAmount = 0;
        const payPeriod = `${month} ${year}`;
        
        const payrollRunId = (await dbService.addDoc('payrollRuns', {})).toString();

        for (const employee of staff) {
            if (employee.salary && employee.salary.amount > 0 && employee.salary.bankName && employee.salary.accountNumber) {
                totalPayrollAmount += employee.salary.amount;

                const newPayslip: Omit<Payslip, 'id'> = {
                    payrollRunId: payrollRunId,
                    staffId: employee.staffId,
                    employeeName: employee.name,
                    payPeriod,
                    amount: employee.salary.amount,
                    bankName: employee.salary.bankName,
                    accountNumber: employee.salary.accountNumber,
                    status: 'Generated',
                    generatedAt: serverTimestamp(),
                };
                batch.set('payslips', null, newPayslip);
            }
        }
        
         const payrollRunData: Omit<PayrollRun, 'id'> = {
            month,
            year,
            executedBy: userId,
            executedByName: userDoc.name,
            totalAmount: totalPayrollAmount,
            employeeCount: staff.length,
            executedAt: serverTimestamp(),
        };

        batch.set('payrollRuns', payrollRunId, payrollRunData);
        
        await batch.commit();
        
        revalidatePath('/dashboard/accountant/payroll');

        return { 
            success: true, 
            employeeCount: staff.length,
            totalAmount: totalPayrollAmount,
        };

    } catch (error: any) {
        console.error('Error running payroll:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}
