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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
  stateOfOrigin: z.string().min(1, { message: 'State of Origin is required.' }),
  department: z.string().min(1, { message: 'Department is required.' }),
  employmentDate: z.date({ required_error: "Employment date is required."}),
  role: z.enum(['Teacher', 'HOD', 'Bursar', 'Principal', 'Support Staff']),
  salary: z.coerce.number().positive({ message: 'Salary must be a positive number.'}),
  bankAccountNumber: z.string().min(10, { message: 'Enter a valid account number.'}).max(10, { message: 'Account number must be 10 digits.'}),
});

// A simple in-memory cache for department codes
const departmentCodes: { [key: string]: string } = {
    'Science': 'SCI',
    'Arts': 'ART',
    'Commercial': 'COM',
    'Administration': 'ADM',
    'English': 'ENG',
    'Accounts': 'ACC',
    'Principal': 'PRN',
    'Bursar': 'BUR'
};


export function AddUserForm({ onUserAdded }: { onUserAdded: () => void }) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      stateOfOrigin: '',
      department: 'Science',
      role: 'Teacher',
      employmentDate: new Date(),
      salary: 0,
      bankAccountNumber: ''
    },
  });

  async function generateStaffId(department: string, employmentDate: Date) {
    const year = format(employmentDate, 'yy');
    const deptCode = departmentCodes[department] || 'GEN';
    const prefix = "GIIA";

    // Get the count of staff in the same department and year
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('department', '==', department),
      where('employmentYear', '==', employmentDate.getFullYear())
    );
    const querySnapshot = await getDocs(q);
    const serialNumber = (querySnapshot.size + 1).toString().padStart(4, '0');

    return `${prefix}${year}${deptCode}${serialNumber}`;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { email, stateOfOrigin, department, employmentDate, role } = values;

      // Check for uniqueness
      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const phoneQuery = query(collection(db, 'users'), where('phone', '==', values.phone));
      const [emailSnapshot, phoneSnapshot] = await Promise.all([getDocs(emailQuery), getDocs(phoneQuery)]);

      if (!emailSnapshot.empty) {
        toast({ variant: 'destructive', title: 'Error', description: 'Email already exists.' });
        return;
      }
      if (!phoneSnapshot.empty) {
        toast({ variant: 'destructive', title: 'Error', description: 'Phone number already exists.' });
        return;
      }
      
      const staffId = await generateStaffId(department, employmentDate);
      const defaultPassword = stateOfOrigin; // Plain text as per spec

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);
      const user = userCredential.user;

      // Create user record in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        staffId: staffId,
        name: `${values.firstName} ${values.lastName}`,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        stateOfOrigin: values.stateOfOrigin,
        department: values.department,
        employmentDate: values.employmentDate,
        employmentYear: values.employmentDate.getFullYear(),
        role: values.role,
        status: 'active',
        salary: values.salary,
        bankAccountNumber: values.bankAccountNumber,
        createdAt: new Date()
      });

      toast({
        title: 'Staff Added Successfully',
        description: `Staff ID: ${staffId} | Default Password: ${defaultPassword}`,
        duration: 9000,
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="08012345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="stateOfOrigin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State of Origin</FormLabel>
               <FormControl>
                <Input placeholder="e.g. Kaduna" {...field} />
              </FormControl>
              <FormDescription>
                This will be used as the staff's default password.
              </FormDescription>
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
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(departmentCodes).map(dept => (
                     <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
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
              <FormLabel>Employment Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
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
                      date > new Date() || date < new Date("1990-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="Bursar">Bursar</SelectItem>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Support Staff">Support Staff</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary</FormLabel>
               <FormControl>
                <Input type="number" placeholder="e.g. 50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="bankAccountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account Number</FormLabel>
               <FormControl>
                <Input placeholder="0123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
           {form.formState.isSubmitting ? 'Adding...' : <> <PlusCircle className="mr-2 h-4 w-4" /> Add Staff</>}
        </Button>
      </form>
    </Form>
  );
}
