
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

const availableRoles = [
  'Teacher',
  'HeadOfDepartment',
  'Principal',
  'Director',
  'ExamOfficer',
  'Accountant',
  'Parent',
  'Student',
  'Admin',
];

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  role: z.enum(['Teacher', 'HeadOfDepartment', 'Principal', 'Director', 'ExamOfficer', 'Accountant', 'Parent', 'Student', 'Admin']),
});

// Function to generate a random password
const generatePassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};

// Function to generate a simple random Staff ID
const generateStaffId = () => {
    const prefix = "GIIA";
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${randomNumber}`;
}

export function AddUserForm({ onUserAdded }: { onUserAdded: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'Teacher',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { email, role, firstName, lastName } = values;

      // Check if email already exists
      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        toast({ variant: 'destructive', title: 'Error', description: 'Email already exists.' });
        setIsSubmitting(false);
        return;
      }
      
      const staffId = generateStaffId();
      const password = generatePassword();

      // Create user in Firebase Auth
      // IMPORTANT: This temporarily signs in as the new user. The RoleContext handles this.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user record in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        staffId: staffId,
        name: `${firstName} ${lastName}`,
        email: email,
        role: role,
        status: "Active",
        createdAt: new Date(),
        department: null,
        phone: null,
        stateOfOrigin: null,
      });

      toast({
        title: 'Staff Added Successfully',
        description: `Staff ID: ${staffId} | Password: ${password}`,
        duration: 20000, // Keep toast on screen longer
      });
      form.reset();
      onUserAdded();

    } catch (e: any) {
      console.error("Error adding user: ", e);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: e.code === 'auth/weak-password' ? 'Password must be at least 6 characters.' : (e.message || 'There was a problem adding the user.'),
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@giia.com.ng" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableRoles.map(role => (
                     <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormDescription>
            A random, secure password will be generated and displayed upon creation.
         </FormDescription>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
           {isSubmitting ? 'Adding...' : <> <PlusCircle className="mr-2 h-4 w-4" /> Add Staff</>}
        </Button>
      </form>
    </Form>
  );
}
