
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { CalendarIcon, Loader2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useAcademicData } from '@/hooks/use-academic-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { createStudent } from '@/actions/student-actions';
import { DateOfBirthInput } from '@/components/ui/date-of-birth-input';


const formSchema = z.object({
  // Personal Info
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  middleName: z.string().optional(),
  gender: z.enum(['Male', 'Female'], {
    required_error: 'Gender is required.',
  }),
  dateOfBirth: z.date({ required_error: 'Date of birth is required.' }),
  profilePicture: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size < 2 * 1024 * 1024, 'Max size is 2MB.'),

  // Contact & Guardian
  address: z.string().min(1, 'Address is required.'),
  guardianName: z.string().min(1, "Guardian's name is required."),
  guardianContact: z.string().min(1, "Guardian's contact is required."),
  guardianEmail: z.string().email('Invalid email address.'),

  // Academic Info
  class: z.string().min(1, 'Please select a class.'),
  admissionDate: z.date({ required_error: 'Admission date is required.' }),
  session: z
    .string()
    .min(1, 'Session is required.')
    .regex(/^\d{4}\/\d{4}$/, 'Format must be YYYY/YYYY (e.g. 2023/2024)'),
  
  // Other
  medicalConditions: z.string().optional(),
  documents: z.instanceof(FileList).optional(),
});

export function AddStudentForm({ onStudentAdded }: { onStudentAdded: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { classes, isLoading: isAcademicDataLoading } = useAcademicData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      address: '',
      guardianName: '',
      guardianContact: '',
      guardianEmail: '',
      session: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      medicalConditions: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value instanceof FileList) {
          for (let i = 0; i < value.length; i++) {
             formData.append(`${key}[${i}]`, value[i]);
          }
        } else {
          formData.append(key, value);
        }
      }
    });

    try {
        const result = await createStudent(formData);
        
        if (result.error) {
            throw new Error(result.error as string);
        }

        toast({
            title: 'Student Enrolled Successfully',
            description: `Student ${values.firstName} ${values.lastName} has been added to the database.`,
        });
        form.reset();
        onStudentAdded();

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Enrollment Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Fatima" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Aliyu" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        </div>
                        <FormField control={form.control} name="middleName" render={({ field }) => ( <FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input placeholder="Bello" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem> )}/>
                             <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel className="mb-1">Date of Birth</FormLabel>
                                        <FormControl>
                                            <DateOfBirthInput
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField control={form.control} name="profilePicture" render={({ field: { onChange, value, ...rest }}) => ( <FormItem><FormLabel>Profile Photo</FormLabel><FormControl><Input type="file" accept="image/png, image/jpeg" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl><FormDescription>Max file size 2MB.</FormDescription><FormMessage /></FormItem>)}/>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Academic Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <FormField control={form.control} name="class" render={({ field }) => ( <FormItem><FormLabel>Class</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isAcademicDataLoading}><FormControl><SelectTrigger><SelectValue placeholder={isAcademicDataLoading ? "Loading..." : "Select Class"} /></SelectTrigger></FormControl><SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )}/>
                             <FormField
                                control={form.control}
                                name="admissionDate"
                                render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                    <FormLabel className="mb-1">Admission Date</FormLabel>
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
                                        <DateOfBirthInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            disableFuture
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField control={form.control} name="session" render={({ field }) => ( <FormItem><FormLabel>Session</FormLabel><FormControl><Input placeholder="2023/2024" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    </CardContent>
                </Card>
            </div>
            {/* Right Column */}
            <div className="space-y-6">
                 <Card>
                    <CardHeader><CardTitle>Guardian & Contact</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <FormField control={form.control} name="guardianName" render={({ field }) => ( <FormItem><FormLabel>Guardian's Full Name</FormLabel><FormControl><Input placeholder="Aisha Ibrahim" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                         <FormField control={form.control} name="guardianContact" render={({ field }) => ( <FormItem><FormLabel>Guardian's Phone</FormLabel><FormControl><Input placeholder="08012345678" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                         <FormField control={form.control} name="guardianEmail" render={({ field }) => ( <FormItem><FormLabel>Guardian's Email</FormLabel><FormControl><Input placeholder="parent@example.com" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                         <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Home Address</FormLabel><FormControl><Input placeholder="123, Main Street, Ikeja, Lagos" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Other Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="medicalConditions" render={({ field }) => ( <FormItem><FormLabel>Known Medical Conditions</FormLabel><FormControl><Input placeholder="e.g. Asthma, Allergies (or N/A)" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="documents" render={({ field: { onChange, value, ...rest }}) => ( <FormItem><FormLabel>Upload Documents</FormLabel><FormControl><Input type="file" multiple onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl><FormDescription>Birth certificate, previous report cards, etc.</FormDescription><FormMessage /></FormItem>)}/>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                Enroll Student
            </Button>
        </div>
      </form>
    </Form>
  );
}
