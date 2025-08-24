
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { Save } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  role: z.string().min(1, { message: 'Role is required.' }),
  department: z.string().min(1, { message: 'Department is required.' }),
});

type ProfessionalInfoFormValues = z.infer<typeof formSchema>;

const departmentCodes: { [key: string]: string } = {
  Science: 'SCI',
  Arts: 'ART',
  Commercial: 'COM',
  Administration: 'ADM',
  Accounts: 'ACC',
  Management: 'MGT'
};

const availableRoles = [
  'Teacher',
  'SLT',
  'ExamOfficer',
  'Accountant',
  'Parent',
  'Student',
  'Admin',
];

export function ProfessionalInfoForm({
  user,
  onUpdate,
}: {
  user: MockUser;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfessionalInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: user.role || '',
      department: user.department || '',
    },
  });

  async function onSubmit(values: ProfessionalInfoFormValues) {
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        role: values.role,
        department: values.department,
      });

      toast({
        title: 'Success',
        description: "The user's professional information has been updated.",
      });
      onUpdate();
    } catch (e: any) {
      console.error('Error updating professional info: ', e);
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
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
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(departmentCodes).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
