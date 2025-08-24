
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  getCountFromServer,
  addDoc
} from 'firebase/firestore';
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
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';

const availableRoles = [
  'Teacher',
  'SLT',
  'ExamOfficer',
  'Accountant',
  'Admin',
];

const NIGERIAN_BANKS = [
  "Access Bank", "Citibank", "Ecobank Nigeria", "Fidelity Bank Nigeria", "First Bank of Nigeria",
  "First City Monument Bank", "Globus Bank", "Guaranty Trust Bank", "Heritage Bank Plc", "Keystone Bank Limited",
  "Parallex Bank", "Polaris Bank", "PremiumTrust Bank", "Providus Bank Plc", "Stanbic IBTC Bank Nigeria Limited",
  "Standard Chartered", "Sterling Bank", "SunTrust Bank Nigeria Limited", "Titan Trust Bank Limited", "Union Bank of Nigeria",
  "United Bank for Africa", "Unity Bank Plc", "Wema Bank", "Zenith Bank"
].map(bank => ({ value: bank.toLowerCase(), label: bank }));

const departmentCodes: { [key: string]: string } = {
  Science: 'SCI',
  Arts: 'ART',
  Commercial: 'COM',
  Administration: 'ADM',
  Accounts: 'ACC',
  Management: 'MGT'
};

const roleCodes: { [key: string]: string } = {
  Teacher: 'TEA',
  HeadOfDepartment: 'HOD',
  Principal: 'PRN',
  Director: 'DIR',
  SLT: 'SLT',
  ExamOfficer: 'EXO',
  Accountant: 'ACC',
  Admin: 'ADM',
  Parent: 'PAR'
};

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().min(1, 'Phone number is required.'),
  role: z.enum(['Teacher', 'SLT', 'ExamOfficer', 'Accountant', 'Admin']),
  stateOfOrigin: z.string().min(1, 'State of Origin is required.'),
  department: z.string().min(1, 'Department is required.'),
  employmentDate: z.date({ required_error: 'Employment date is required.' }),
  address: z.string().min(1, 'Address is required.'),
  dob: z.date({ required_error: 'Date of birth is required.' }),
  gender: z.string().min(1, 'Gender is required.'),
  salaryAmount: z.number().min(0, 'Salary must be a positive number.').optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
});


async function generateStaffId(role: string, department: string) {
    const year = format(new Date(), 'yy');
    const roleCode = roleCodes[role] || 'STAFF';
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role));
    const snapshot = await getCountFromServer(q);
    const serialNumber = (snapshot.data().count + 1).toString().padStart(4, '0');

    return `GIIA${year}${roleCode}${serialNumber}`;
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
      phone: '',
      role: 'Teacher',
      stateOfOrigin: '',
      department: '',
      address: '',
      gender: '',
      accountNumber: '',
      accountName: '',
      bankName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { email, role, stateOfOrigin } = values;

      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Email already exists.',
        });
        setIsSubmitting(false);
        return;
      }

      const staffId = await generateStaffId(values.role, values.department);
      const password = stateOfOrigin; // Use State of Origin as the password

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        staffId: staffId,
        firstName: values.firstName,
        lastName: values.lastName,
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        role: role,
        stateOfOrigin: stateOfOrigin,
        department: values.department,
        employmentDate: values.employmentDate,
        employmentYear: values.employmentDate.getFullYear(),
        status: 'Active',
        createdAt: new Date(),
        personalInfo: {
          address: values.address,
          dob: values.dob,
          gender: values.gender,
          nextOfKin: null,
          profilePicture: null,
        },
        salary: {
          amount: values.salaryAmount || 0,
          bankName: NIGERIAN_BANKS.find(b => b.value === values.bankName)?.label || '',
          accountNumber: values.accountNumber || '',
          accountName: values.accountName || '',
          paymentStatus: 'Active',
        },
        permissions: {
            canAccessPortal: true,
            canUploadLessonNotes: role === 'Teacher',
            canViewSalary: true,
        }
      });
      
      await addDoc(collection(db, 'auditLog'), {
        actorId: 'Admin', // Assume admin is creating user
        action: 'create_user',
        entity: 'user',
        entityId: user.uid,
        timestamp: new Date(),
        details: `Created user ${values.firstName} ${values.lastName} with role ${role}`
      });

      toast({
        title: 'Staff Added Successfully',
        description: `Staff ID: ${staffId}. The default password is the staff's State of Origin.`,
        duration: 20000,
      });
      form.reset();
      onUserAdded();
    } catch (e: any) {
      console.error('Error adding user: ', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          e.code === 'auth/weak-password'
            ? 'Password must be at least 6 characters.'
            : e.message || 'There was a problem adding the user.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>First Name</FormLabel> <FormControl> <Input placeholder="e.g. John" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem> <FormLabel>Last Name</FormLabel> <FormControl> <Input placeholder="e.g. Doe" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl> <Input placeholder="name@giia.com.ng" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl> <Input placeholder="08012345678" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="stateOfOrigin" render={({ field }) => ( <FormItem> <FormLabel>State of Origin (Password)</FormLabel> <FormControl> <Input placeholder="e.g. Kaduna" {...field} /> </FormControl> <FormDescription>This will be the default password.</FormDescription> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Address</FormLabel> <FormControl> <Input placeholder="No. 123, Main St." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="gender" render={({ field }) => ( 
                <FormItem> 
                    <FormLabel>Gender</FormLabel> 
                    <Select onValueChange={field.onChange} defaultValue={field.value}> 
                        <FormControl> 
                            <SelectTrigger> <SelectValue placeholder="Select gender" /> </SelectTrigger> 
                        </FormControl> 
                        <SelectContent> <SelectItem value="Male">Male</SelectItem> <SelectItem value="Female">Female</SelectItem> </SelectContent> 
                    </Select> 
                    <FormMessage /> 
                </FormItem> 
            )}/>
            <FormField control={form.control} name="dob" render={({ field }) => ( 
                <FormItem className="flex flex-col"> 
                    <FormLabel>Date of Birth</FormLabel> 
                    <Popover> 
                        <PopoverTrigger asChild>
                           <FormControl>
                            <Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground' )}> 
                                {field.value ? ( format(field.value, 'PPP') ) : ( <span>Pick a date</span> )} 
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> 
                            </Button>
                           </FormControl>
                        </PopoverTrigger> 
                        <PopoverContent className="w-auto p-0" align="start"> 
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus /> 
                        </PopoverContent> 
                    </Popover> 
                    <FormMessage /> 
                </FormItem> 
            )}/>
            <FormField control={form.control} name="role" render={({ field }) => ( 
                <FormItem> 
                    <FormLabel>Role</FormLabel> 
                    <Select onValueChange={field.onChange} defaultValue={field.value}> 
                        <FormControl> 
                            <SelectTrigger> <SelectValue placeholder="Select a role" /> </SelectTrigger> 
                        </FormControl> 
                        <SelectContent> 
                            {availableRoles.map(role => ( <SelectItem key={role} value={role}>{role}</SelectItem> ))} 
                        </SelectContent> 
                    </Select> 
                    <FormMessage /> 
                </FormItem> 
            )}/>
            <FormField control={form.control} name="department" render={({ field }) => ( 
                <FormItem> 
                    <FormLabel>Department</FormLabel> 
                    <Select onValueChange={field.onChange} defaultValue={field.value}> 
                        <FormControl> 
                            <SelectTrigger> <SelectValue placeholder="Select a department" /> </SelectTrigger> 
                        </FormControl> 
                        <SelectContent> 
                            {Object.keys(departmentCodes).map((dept) => ( <SelectItem key={dept} value={dept}>{dept}</SelectItem> ))} 
                        </SelectContent> 
                    </Select> 
                    <FormMessage /> 
                </FormItem> 
            )}/>
            <FormField control={form.control} name="employmentDate" render={({ field }) => ( 
                <FormItem className="flex flex-col"> 
                    <FormLabel>Employment Date</FormLabel> 
                    <Popover> 
                        <PopoverTrigger asChild>
                           <FormControl>
                            <Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground' )}> 
                                {field.value ? ( format(field.value, 'PPP') ) : ( <span>Pick a date</span> )} 
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> 
                            </Button>
                           </FormControl>
                        </PopoverTrigger> 
                        <PopoverContent className="w-auto p-0" align="start"> 
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /> 
                        </PopoverContent> 
                    </Popover> 
                    <FormMessage /> 
                </FormItem> 
            )}/>
            <FormField control={form.control} name="bankName" render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                    <Combobox
                        options={NIGERIAN_BANKS}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a bank"
                        searchPlaceholder="Search banks..."
                        notFoundText="No bank found."
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="accountNumber" render={({ field }) => ( <FormItem> <FormLabel>Account Number</FormLabel> <FormControl> <Input placeholder="0123456789" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="accountName" render={({ field }) => ( <FormItem> <FormLabel>Account Name</FormLabel> <FormControl> <Input placeholder="John Doe" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="salaryAmount" render={({ field }) => ( <FormItem> <FormLabel>Salary Amount (₦)</FormLabel> <FormControl> <Input type="number" placeholder="e.g. 150000" onChange={e => field.onChange(Number(e.target.value))} /> </FormControl> <FormMessage /> </FormItem> )}/>

        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            'Adding Staff...'
          ) : (
            <>
              {' '}
              <PlusCircle className="mr-2 h-4 w-4" /> Add Staff
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
