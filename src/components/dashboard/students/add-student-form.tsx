'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
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

export function AddStudentForm({ onStudentAdded }: { onStudentAdded: () => void }) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

   async function generateStudentId() {
    const year = format(new Date(), 'yy');
    const prefix = "GIIA/STU/";

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'Student'));
    const querySnapshot = await getDocs(q);
    const serialNumber = (querySnapshot.size + 1).toString().padStart(4, '0');

    return `${prefix}${year}/${serialNumber}`;
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { email } = values;

      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        toast({ variant: 'destructive', title: 'Error', description: 'Email already exists.' });
        return;
      }
      
      const studentId = await generateStudentId();
      const password = generatePassword();

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        staffId: studentId, // Using staffId field for student ID for consistency
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        role: "Student",
        status: "Active",
        createdAt: new Date()
      });

      toast({
        title: 'Student Added Successfully',
        description: `Student ID: ${studentId} | Password: ${password}`,
        duration: 20000,
      });
      form.reset();
      onStudentAdded();

    } catch (e: any) {
      console.error("Error adding student: ", e);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: e.message || 'There was a problem adding the student.',
      });
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
                <Input placeholder="e.g. Binta" {...field} />
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
                <Input placeholder="e.g. Bello" {...field} />
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
              <FormLabel>Parent's or Student's Email</FormLabel>
              <FormControl>
                <Input placeholder="parent@example.com" {...field} />
              </FormControl>
               <FormDescription>
                This will be used for login and communication.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormDescription>
            A random, secure password will be generated and displayed upon creation.
         </FormDescription>
       
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
           {form.formState.isSubmitting ? 'Adding...' : <> <PlusCircle className="mr-2 h-4 w-4" /> Add Student</>}
        </Button>
      </form>
    </Form>
  );
}
