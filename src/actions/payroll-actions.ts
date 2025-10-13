
'use server';

import { dbService, auth, db } from '@/lib/firebase';
import { serverTimestamp, Timestamp, doc } from 'firebase/firestore';
import type { MockUser, PayrollRun, Payslip } from '@/lib/schema';
import { revalidatePath } from 'next/cache';

export async function runPayroll(month: string, year: number) {
    try {
        // 1. Authenticate the user (must be an accountant or admin)
        const currentUser = await auth.currentUser;
        if (!currentUser) {
            throw new Error("Authentication failed. You must be logged in.");
        }
        const userDoc = await dbService.getDoc<MockUser>('users', currentUser.uid);
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

        // 3. Fetch all staff with a configured salary
        const staff = await dbService.getDocs<MockUser>('users', [
            { type: 'where', fieldPath: 'salary.amount', opStr: '>', value: 0 },
            { type: 'where', fieldPath: 'status', opStr: '==', value: 'active' },
        ]);

        if (staff.length === 0) {
            return { error: 'No staff members with configured salaries found.' };
        }

        // 4. Start a batch write
        const batch = dbService.createBatch();
        let totalPayrollAmount = 0;
        const payPeriod = `${month} ${year}`;
        
        // 5. Create the main PayrollRun document
        const payrollRunRef = doc(db, 'payrollRuns');
        
        // 6. Loop through staff and create a payslip for each
        for (const employee of staff) {
            if (employee.salary && employee.salary.amount > 0 && employee.salary.bankName && employee.salary.accountNumber) {
                totalPayrollAmount += employee.salary.amount;

                const newPayslip: Omit<Payslip, 'id'> = {
                    payrollRunId: payrollRunRef.id,
                    staffId: employee.staffId,
                    employeeName: employee.name,
                    payPeriod,
                    amount: employee.salary.amount,
                    bankName: employee.salary.bankName,
                    accountNumber: employee.salary.accountNumber,
                    status: 'Generated',
                    generatedAt: serverTimestamp(),
                };
                const payslipRef = doc(db, 'payslips');
                batch.set(payslipRef, newPayslip);
            }
        }
        
        // 7. Update the PayrollRun document with final details
         const payrollRunData: Omit<PayrollRun, 'id'> = {
            month,
            year,
            executedBy: currentUser.uid,
            executedByName: userDoc.name,
            totalAmount: totalPayrollAmount,
            employeeCount: staff.length,
            executedAt: serverTimestamp(),
        };
        batch.set(payrollRunRef, payrollRunData);
        
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
