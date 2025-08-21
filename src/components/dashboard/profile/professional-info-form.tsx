
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
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
import type { MockUser } from '@/lib/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/context/role-context';


const formSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  department: z.string().min(1, 'Department is required.'),
  employmentDate: z.date({
    required_error: "A date of employment is required.",
  }),
});

type ProfessionalInfoFormValues = z.infer<typeof formSchema>;

interface ProfessionalInfoFormProps {
  userData: MockUser;
  onUpdate: (data: Partial<MockUser>) => void;
}

export function ProfessionalInfoForm({
  userData,
  onUpdate,
}: ProfessionalInfoFormProps) {
  const { toast } = useToast();

  const form = useForm<ProfessionalInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: userData.role || '',
      department: userData.department || '',
      employmentDate: userData.employmentDate ? new Date((userData.employmentDate as any).seconds * 1000) : new Date(),
    },
  });

  const onSubmit = async (values: ProfessionalInfoFormValues) => {
    try {
      const userDocRef = doc(db, 'users', userData.id);
      const updatedData = {
        role: values.role,
        department: values.department,
        employmentDate: values.employmentDate,
      };

      await updateDoc(userDocRef, updatedData);

      onUpdate(updatedData);
      toast({
        title: 'Success',
        description: 'Professional information updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update professional information.',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Staff ID
              </p>
              <p className="text-base font-semibold">{userData.staffId}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">
                Email
              </p>
              <p className="text-base font-semibold">{userData.email}</p>
            </div>
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
                       <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Principal">Principal</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="HeadOfDepartment">HOD</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Accountant">Accountant</SelectItem>
                        <SelectItem value="ExamOfficer">Exam Officer</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
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
                       <SelectItem value="Science">Science</SelectItem>
                       <SelectItem value="Arts">Arts</SelectItem>
                       <SelectItem value="Administration">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="employmentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Employment</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Saving...'
              : 'Save Professional Info'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
