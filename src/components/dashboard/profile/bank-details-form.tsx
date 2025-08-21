
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { MockUser } from '@/lib/schema';
import { useRole } from '@/context/role-context';

const formSchema = z.object({
    bankName: z.string().min(1, 'Bank name is required.'),
    accountNumber: z.string().min(10, 'Account number must be at least 10 digits.').max(10, 'Account number must be 10 digits.'),
    accountName: z.string().min(1, 'Account name is required.'),
    salaryAmount: z.string().optional(),
});

type BankDetailsFormValues = z.infer<typeof formSchema>;

interface BankDetailsFormProps {
    userData: MockUser;
    onUpdate: (data: Partial<MockUser>) => void;
}

export function BankDetailsForm({ userData, onUpdate }: BankDetailsFormProps) {
    const { toast } = useToast();
    const { role } = useRole(); // For admin check
    const bankAccountParts = userData.salary?.bankAccount?.split(' - ') || ['','',''];

    const form = useForm<BankDetailsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bankName: bankAccountParts[0] || '',
            accountNumber: bankAccountParts[1] || '',
            accountName: bankAccountParts[2] || '',
            salaryAmount: new Intl.NumberFormat('en-NG').format(userData.salary?.amount || 0)
        }
    });

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
      const rawValue = e.target.value.replace(/,/g, '');
      if (!isNaN(Number(rawValue))) {
        const formattedValue = new Intl.NumberFormat('en-NG').format(Number(rawValue));
        field.onChange(formattedValue);
      } else if (rawValue === '') {
        field.onChange('');
      }
    };


    const onSubmit = async (values: BankDetailsFormValues) => {
        try {
            const userDocRef = doc(db, 'users', userData.id);
            const bankAccountString = `${values.bankName} - ${values.accountNumber} - ${values.accountName}`;
            const salaryAmount = Number(values.salaryAmount?.replace(/,/g, '') || 0);

            const updatedData: any = {
                'salary.bankAccount': bankAccountString
            };

            if (role === 'Admin') {
                updatedData['salary.amount'] = salaryAmount;
            }
            
            await updateDoc(userDocRef, updatedData);

            onUpdate({ salary: { ...userData.salary, amount: salaryAmount, bankAccount: bankAccountString } });
            toast({ title: 'Success', description: 'Bank details updated successfully.' });
        } catch (error) {
            console.error('Error updating bank details:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update bank details.' });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {role === 'Admin' && (
                        <FormField
                            control={form.control}
                            name="salaryAmount"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Salary (NGN)</FormLabel>
                                <FormControl>
                                <Input 
                                    type="text" 
                                    placeholder="e.g. 150,000"
                                    {...field}
                                    onChange={(e) => handleSalaryChange(e, field)}
                                />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Guaranty Trust Bank" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Number (10 Digits)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="accountName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="As it appears on your bank statement" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end">
                     <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
