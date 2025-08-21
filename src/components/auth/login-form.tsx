
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';


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
import { useRole } from '@/context/role-context';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';

const formSchema = z.object({
  staffId: z.string().min(1, { message: 'Staff ID is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export function LoginForm() {
  const router = useRouter();
  const { setRole } = useRole();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Find the user by staffId in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('staffId', '==', values.staffId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid Staff ID or Password.',
        });
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const passwordToTry = values.password;

      // 2. Sign in with the user's email and provided password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email, // Use email from Firestore to sign in
        passwordToTry
      );
      
      const user = userCredential.user;

      if (user) {
        setRole(userData.role);

        // 3. Show password change reminder if needed
        // Compare the entered password (lowercase) with the stored state of origin (lowercase)
        if (passwordToTry.toLowerCase() === userData.stateOfOrigin.toLowerCase()) {
           toast({
              title: 'Welcome!',
              description: 'For your security, please update your password in your profile settings.',
              duration: 9000,
            });
        } else {
             toast({
              title: 'Login Successful',
              description: `Welcome back! You are logged in as ${userData.role}.`,
            });
        }
        router.push('/dashboard');
      }
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid Staff ID or Password.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="staffId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g. GIIA24SCI0001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
