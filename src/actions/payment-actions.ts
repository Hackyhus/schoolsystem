
'use server';

import { z } from 'zod';
import { dbService } from '@/lib/firebase';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Invoice, Payment, MockUser } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/firebase';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amountPaid: z.coerce.number().positive('Payment amount must be positive'),
  paymentDate: z.date({ required_error: 'Payment date is required' }),
  paymentMethod: z.enum(['Bank Transfer', 'POS', 'Cash']),
  notes: z.string().optional(),
});

export async function recordPayment(values: z.infer<typeof paymentSchema>) {
    try {
        const parsed = paymentSchema.safeParse(values);
        if (!parsed.success) {
            return { error: 'Invalid data provided.' };
        }
        
        // This is a protected action, so we can assume user is logged in
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return { error: 'Authentication required.' };
        }

        const { invoiceId, amountPaid, paymentDate, paymentMethod, notes } = parsed.data;

        // 1. Fetch the invoice
        const invoice = await dbService.getDoc<Invoice>('invoices', invoiceId);
        if (!invoice) {
            return { error: 'Invoice not found.' };
        }
        
        // 2. Validate payment
        if (invoice.status === 'Paid') {
            return { error: 'This invoice has already been fully paid.' };
        }
        if (amountPaid > invoice.balance) {
            return { error: `Payment of NGN ${amountPaid.toLocaleString()} exceeds the balance of NGN ${invoice.balance.toLocaleString()}.` };
        }
        
        // 3. Prepare updates for batch
        const batch = dbService.createBatch();
        const newBalance = invoice.balance - amountPaid;
        const newAmountPaid = invoice.amountPaid + amountPaid;
        let newStatus: Invoice['status'] = 'Partially Paid';
        if (newBalance <= 0) {
            newStatus = 'Paid';
        }

        // 4. Update the invoice document
        batch.update('invoices', invoiceId, {
            amountPaid: newAmountPaid,
            balance: newBalance,
            status: newStatus,
        });
        
        // 5. Create a new payment record for auditing
        const accountantDoc = await dbService.getDoc<MockUser>('users', currentUser.uid);

        const newPayment: Omit<Payment, 'id'> = {
            invoiceId: invoice.invoiceId,
            studentId: invoice.studentId,
            studentName: invoice.studentName,
            amountPaid,
            paymentDate: Timestamp.fromDate(paymentDate),
            paymentMethod,
            recordedBy: currentUser.uid,
            recordedByName: accountantDoc?.name || 'N/A',
            notes,
            createdAt: serverTimestamp(),
        };

        batch.set('payments', null, newPayment);
        
        // 6. Commit the batch
        await batch.commit();

        revalidatePath('/dashboard/accountant/payments');
        revalidatePath('/dashboard/accountant/invoices');

        return { success: true };

    } catch (error: any) {
        console.error('Error recording payment:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}

