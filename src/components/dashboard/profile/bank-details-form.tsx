
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { useRole } from '@/context/role-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NIGERIAN_BANKS = [
  "Access Bank", "Citibank", "Ecobank Nigeria", "Fidelity Bank Nigeria", "First Bank of Nigeria",
  "First City Monument Bank", "Globus Bank", "Guaranty Trust Bank", "Heritage Bank Plc", "Keystone Bank Limited",
  "Parallex Bank", "Polaris Bank", "PremiumTrust Bank", "Providus Bank Plc", "Stanbic IBTC Bank Nigeria Limited",
  "Standard Chartered", "Sterling Bank", "SunTrust Bank Nigeria Limited", "Titan Trust Bank Limited", "Union Bank of Nigeria",
  "United Bank for Africa", "Unity Bank Plc", "Wema Bank", "Zenith Bank"
];


const formSchema = z.object({
  salaryAmount: z.string().optional(),
  bankName: z.string().min(1, 'Please select a bank.'),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits.').max(10, 'Account number must be 10 digits.'),
  accountName: z.string().min(1, 'Account name is required.'),
});

type BankDetailsFormValues = z.infer<typeof formSchema>;

export function BankDetailsForm({
  user,
  onUpdate,
}: {
  user: MockUser;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { role: currentUserRole } = useRole();

  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salaryAmount: user.salary?.amount.toLocaleString() || '0',
      bankName: user.salary?.bankName || '',
      accountNumber: user.salary?.accountNumber || '',
      accountName: user.salary?.accountName || '',
    },
  });

  const handleSalaryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: any
  ) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(Number(rawValue))) {
      const formattedValue = new Intl.NumberFormat('en-NG').format(
        Number(rawValue)
      );
      field.onChange(formattedValue);
    } else if (rawValue === '') {
      field.onChange('');
    }
  };

  async function onSubmit(values: BankDetailsFormValues) {
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.id);
      
      const updateData: any = {
        'salary.bankName': values.bankName,
        'salary.accountNumber': values.accountNumber,
        'salary.accountName': values.accountName,
      };

      if (currentUserRole === 'Admin' && values.salaryAmount) {
        updateData['salary.amount'] = Number(values.salaryAmount.replace(/,/g, ''));
      }

      await updateDoc(userRef, updateData);

      toast({
        title: 'Success',
        description: 'Bank and salary details have been updated.',
      });
      onUpdate();
    } catch (e: any) {
      console.error('Error updating bank details: ', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem updating the details.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="space-y-4">
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
                    disabled={currentUserRole !== 'Admin'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NIGERIAN_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 0123456789" {...field} />
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
                  <Input placeholder="e.g. John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            'Saving...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

    