
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';


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


const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
  stateOfOrigin: z.string().min(1, { message: 'State of Origin is required.' }),
  department: z.string().min(1, { message: 'Department is required.' }),
  employmentDate: z.string().refine((val) => dateRegex.test(val), {
    message: "Invalid date format. Please use DD/MM/YYYY.",
  }),
  role: z.enum(['Teacher', 'HeadOfDepartment', 'Principal', 'Director', 'ExamOfficer', 'Accountant', 'Parent', 'Student', 'Admin']),
  address: z.string().min(1, { message: "Address is required."}),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required.'}),
  dob: z.string().refine((val) => dateRegex.test(val), {
    message: "Invalid date format. Please use DD/MM/YYYY.",
  }),
  salaryAmount: z.string().min(1, { message: "Initial salary is required." }),
});

// Function to parse DD/MM/YYYY string to Date
const parseDateString = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number);
  // Month is 0-indexed in JavaScript Date objects
  return new Date(year, month - 1, day);
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
      address: '',
      salaryAmount: '',
      dob: '',
      employmentDate: '',
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

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
      const rawValue = e.target.value.replace(/,/g, '');
      if (!isNaN(Number(rawValue))) {
        const formattedValue = new Intl.NumberFormat('en-NG').format(Number(rawValue));
        field.onChange(formattedValue);
      } else if (rawValue === '') {
        field.onChange('');
      }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (value.length > 5) {
      value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
    }
    field.onChange(value);
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { email, stateOfOrigin, department } = values;
      const employmentDate = parseDateString(values.employmentDate);
      const dob = parseDateString(values.dob);
      const salaryAmount = Number(values.salaryAmount.replace(/,/g, ''));


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
        firstName: values.firstName,
        lastName: values.lastName,
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        stateOfOrigin: values.stateOfOrigin,
        department: values.department,
        role: values.role,
        employmentDate: employmentDate,
        employmentYear: employmentDate.getFullYear(),
        salary: {
            amount: salaryAmount,
            bankAccount: null,
            paymentStatus: "Active"
        },
        personalInfo: {
            address: values.address,
            gender: values.gender,
            dob: dob,
            nextOfKin: null,
            profilePicture: null
        },
        permissions: {
            canUploadLessonNotes: true,
            canViewSalary: true,
            canAccessPortal: true
        },
        status: "Active",
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
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                    <Input placeholder="123 Main St, Kaduna" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
                <FormItem className="space-y-3">
                <FormLabel>Gender</FormLabel>
                <FormControl>
                    <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                    >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                        <RadioGroupItem value="Male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                        <RadioGroupItem value="Female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                    </RadioGroup>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
         <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input
                  placeholder="DD/MM/YYYY"
                  {...field}
                  onChange={(e) => handleDateInputChange(e, field)}
                  maxLength={10}
                />
              </FormControl>
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
            <FormItem>
              <FormLabel>Employment Date</FormLabel>
              <FormControl>
                 <Input
                  placeholder="DD/MM/YYYY"
                  {...field}
                  onChange={(e) => handleDateInputChange(e, field)}
                  maxLength={10}
                />
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
            name="salaryAmount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Initial Salary (NGN)</FormLabel>
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
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
           {form.formState.isSubmitting ? 'Adding...' : <> <PlusCircle className="mr-2 h-4 w-4" /> Add Staff</>}
        </Button>
      </form>
    </Form>
  );
}
