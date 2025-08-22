
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
  identifier: z.string().min(1, { message: 'ID or Email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export function LoginForm() {
  const router = useRouter();
  const { setRole } = useRole();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Determine if the identifier is an email or a Staff/Student ID
      const isEmail = values.identifier.includes('@');
      let userEmail = '';
      let userData: any = null;

      const usersRef = collection(db, 'users');
      
      if (isEmail) {
        // If it's an email, we already have it. Find the user doc to get the role.
        userEmail = values.identifier;
        const q = query(usersRef, where('email', '==', userEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            throw new Error("Invalid credentials");
        }
        userData = querySnapshot.docs[0].data();

      } else {
        // If it's a Staff/Student ID, find the user doc to get the email.
        const q = query(usersRef, where('staffId', '==', values.identifier));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
           throw new Error("Invalid credentials");
        }
        userData = querySnapshot.docs[0].data();
        userEmail = userData.email;
      }
      

      if (!userEmail || !userData) {
        throw new Error("Invalid credentials");
      }

      // 2. Sign in with the user's email and provided password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userEmail,
        values.password
      );
      
      const user = userCredential.user;

      if (user) {
        setRole(userData.role);

        // 3. Show password change reminder if needed
        const isDefaultPassword = (userData.stateOfOrigin && values.password.toLowerCase() === userData.stateOfOrigin.toLowerCase()) || 
                                (userData.generatedPassword && values.password === userData.generatedPassword);
        
        if (isDefaultPassword) {
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
        description: 'Invalid ID/Email or Password.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff/Student ID or Email</FormLabel>
              <FormControl>
                <Input placeholder="e.g. GIIA24TEA0001 or name@giia.com.ng" {...field} />
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
