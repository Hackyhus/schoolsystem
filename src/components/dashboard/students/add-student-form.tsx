
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { collection, doc, setDoc, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
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
  parentEmail: z.string().email({ message: "Please enter a valid parent's email." }),
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
      parentEmail: '',
    },
  });

   async function generateStudentId() {
    const year = format(new Date(), 'yy');
    const prefix = "GIIA/STU/";

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'Student'));
    const snapshot = await getCountFromServer(q);
    const serialNumber = (snapshot.data().count + 1).toString().padStart(4, '0');

    return `${prefix}${year}/${serialNumber}`;
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { parentEmail } = values;
      
      const studentId = await generateStudentId();
      const password = generatePassword();
      
      // A parent account might exist. If not, this will create it.
      // This is a simplified flow. A real app might have a more robust parent onboarding.
      try {
        await createUserWithEmailAndPassword(auth, parentEmail, password);
      } catch (error: any) {
        if (error.code !== 'auth/email-already-exists') {
          throw error; // Re-throw if it's not the error we expect
        }
        // If email exists, we proceed, assuming it's the correct parent.
      }
      
      // Since we can't reliably get the UID of the parent if they already exist without signing them in,
      // we'll proceed to create the student record. 
      // The parent can be linked later or via other means.

      // For simplicity, we are creating a "Student" record that is identified by its ID.
      // The login will be handled by the parent using their email.
      const studentDocRef = doc(collection(db, 'users'));
      await setDoc(studentDocRef, {
        uid: studentDocRef.id,
        staffId: studentId, // Using staffId field for student ID for consistency
        name: `${values.firstName} ${values.lastName}`,
        email: parentEmail, // The parent's email is the contact point
        role: "Student",
        status: "Active",
        createdAt: new Date(),
        // Storing the generated password so the parent can use it for the first login
        // In a real scenario, you'd send this via a secure channel.
        generatedPassword: password, 
      });

      toast({
        title: 'Student Added Successfully',
        description: `Student ID: ${studentId}. Parent Login: ${parentEmail} | Default Password: ${password}`,
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
          name="parentEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent's Email</FormLabel>
              <FormControl>
                <Input placeholder="parent@example.com" {...field} />
              </FormControl>
               <FormDescription>
                This will be used for login and communication. A new parent account will be created if one doesn't exist.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormDescription>
            A random, secure password will be generated for the parent's first login and displayed upon creation.
         </FormDescription>
       
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
           {form.formState.isSubmitting ? 'Adding...' : <> <PlusCircle className="mr-2 h-4 w-4" /> Add Student</>}
        </Button>
      </form>
    </Form>
  );
}
