
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

const formSchema = z.object({
  salaryAmount: z.string().min(1, { message: 'Salary is required.' }),
  bankAccount: z.string().optional(),
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

  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salaryAmount: user.salary?.amount.toString() || '',
      bankAccount: user.salary?.bankAccount || '',
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
      await updateDoc(userRef, {
        'salary.amount': Number(values.salaryAmount.replace(/,/g, '')),
        'salary.bankAccount': values.bankAccount,
      });

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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 0123456789" {...field} />
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
