
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import * as z from 'zod';
import { collection, doc, setDoc, getCountFromServer, query, where, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
import { auth, db, storage } from '@/lib/firebase';
import { CalendarIcon, PlusCircle, Trash2, UserPlus, FileUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicData } from '@/hooks/use-academic-data';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const guardianSchema = z.object({
  fullName: z.string().min(1, 'Guardian name is required.'),
  relationship: z.string().min(1, 'Relationship is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  email: z.string().email('Valid email is required.'),
  address: z.string().min(1, 'Address is required.'),
  occupation: z.string().optional(),
});

const formSchema = z.object({
  // Student Info
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  gender: z.enum(['Male', 'Female', 'Other']),
  dateOfBirth: z.date({ required_error: 'Date of birth is required.' }),
  classLevel: z.string().min(1, 'Please select a class.'),
  sessionYear: z.string().min(1, 'Session year is required.'),

  // Guardians
  guardians: z.array(guardianSchema).min(1, 'At least one guardian is required.'),

  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  relationToStudent: z.string().optional(),
  
  // Health Info
  bloodGroup: z.string().optional(),
  genotype: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  
  // Documents
  birthCertificate: z.instanceof(FileList).optional(),
});

const generatePassword = (length = 10) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

async function generateStudentId() {
  const year = format(new Date(), 'yy');
  const prefix = "GIIA/STU/";
  const studentsCollection = collection(db, 'students');
  const snapshot = await getCountFromServer(studentsCollection);
  const serialNumber = (snapshot.data().count + 1).toString().padStart(4, '0');
  return `${prefix}${year}/${serialNumber}`;
}


export function AddStudentForm({ onStudentAdded }: { onStudentAdded: () => void }) {
  const { toast } = useToast();
  const { classes, isLoading: isAcademicDataLoading } = useAcademicData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'Male',
      classLevel: '',
      sessionYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      guardians: [{ fullName: '', relationship: '', phone: '', email: '', address: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guardians",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const studentId = await generateStudentId();
    const batch = writeBatch(db);

    try {
      // 1. Handle Guardian/Parent account creation
      const primaryGuardian = values.guardians[0];
      const password = generatePassword();
      let parentUserId: string;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, primaryGuardian.email, password);
        parentUserId = userCredential.user.uid;
        
        const parentUserRef = doc(db, 'users', parentUserId);
        batch.set(parentUserRef, {
            uid: parentUserId,
            name: primaryGuardian.fullName,
            email: primaryGuardian.email,
            phone: primaryGuardian.phone,
            role: 'Parent',
            status: 'Active',
            createdAt: new Date(),
        });
        
        toast({
          title: "Parent Account Created",
          description: `Login: ${primaryGuardian.email} | Password: ${password}. Please share this securely.`,
          duration: 30000,
        });

      } catch (error: any) {
        if (error.code !== 'auth/email-already-in-use') {
          throw error; // Re-throw other errors
        }
        // If email exists, we need to find the user's UID. A Cloud Function is best for this.
        // For now, we'll show a message and stop.
         toast({
          variant: "destructive",
          title: "Parent Exists",
          description: `A user with email ${primaryGuardian.email} already exists. Cannot create a new student account automatically.`,
          duration: 10000,
        });
        return; // Stop submission
      }
      
       // 2. Handle Document Upload
      let birthCertDoc = null;
      if (values.birthCertificate && values.birthCertificate.length > 0) {
        const file = values.birthCertificate[0];
        const storageRef = ref(storage, `student-documents/${studentId}/birth-certificate-${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        birthCertDoc = {
          documentType: 'Birth Certificate',
          fileUrl: downloadURL,
          storagePath: uploadResult.ref.fullPath,
        };
      }


      // 3. Prepare Student Data
      const studentDocRef = doc(db, 'students', studentId);
      const studentData = {
        id: studentId,
        studentId: studentId,
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        classLevel: values.classLevel,
        sessionYear: values.sessionYear,
        status: 'Active',
        createdAt: new Date(),
        guardians: values.guardians.map((g, index) => ({ ...g, isPrimary: index === 0, userId: index === 0 ? parentUserId : null })),
        contacts: values.emergencyContactName ? [{
          emergencyContactName: values.emergencyContactName,
          emergencyContactPhone: values.emergencyContactPhone,
          relationToStudent: values.relationToStudent,
        }] : [],
        documents: birthCertDoc ? [birthCertDoc] : [],
        health: {
          bloodGroup: values.bloodGroup,
          genotype: values.genotype,
          allergies: values.allergies,
          medicalConditions: values.medicalConditions,
        }
      };

      batch.set(studentDocRef, studentData);

      // 4. Commit all database operations
      await batch.commit();

      toast({
        title: 'Student Added Successfully!',
        description: `Student ${values.firstName} ${values.lastName} has been registered with ID: ${studentId}.`,
        duration: 10000,
      });

      form.reset();
      onStudentAdded();

    } catch (e: any) {
      console.error("Error adding student: ", e);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: e.message || 'There was a problem adding the student.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Information */}
        <Card>
          <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>First Name</FormLabel> <FormControl> <Input placeholder="e.g. Aisha" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem> <FormLabel>Last Name</FormLabel> <FormControl> <Input placeholder="e.g. Yusuf" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
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
                            date > new Date() || date < new Date('2000-01-01')
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
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="classLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isAcademicDataLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isAcademicDataLoading ? "Loading..." : "Select Class"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map(c => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="sessionYear" render={({ field }) => ( <FormItem> <FormLabel>Academic Session</FormLabel> <FormControl> <Input placeholder="e.g. 2024/2025" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Guardian Information</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={() => append({ fullName: '', relationship: '', phone: '', email: '', address: '' })} > <UserPlus className="mr-2 h-4 w-4"/> Add Guardian </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-md border p-4 relative">
                <p className="font-semibold text-sm text-muted-foreground">Guardian {index + 1} {index === 0 && '(Primary Contact & Portal User)'}</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name={`guardians.${index}.fullName`} render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name={`guardians.${index}.relationship`} render={({ field }) => ( <FormItem> <FormLabel>Relationship</FormLabel> <FormControl> <Input placeholder="e.g. Father, Mother" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name={`guardians.${index}.phone`} render={({ field }) => ( <FormItem> <FormLabel>Phone</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name={`guardians.${index}.email`} render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl> <Input type="email" {...field} /> </FormControl> {index === 0 && <FormDescription>This email will be used for parent portal login.</FormDescription>} <FormMessage /> </FormItem> )} />
                </div>
                 <FormField control={form.control} name={`guardians.${index}.address`} render={({ field }) => ( <FormItem> <FormLabel>Address</FormLabel> <FormControl> <Textarea {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                {index > 0 && <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4"/></Button>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Health & Emergency */}
         <Card>
            <CardHeader><CardTitle>Health & Emergency Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="bloodGroup" render={({ field }) => ( <FormItem> <FormLabel>Blood Group</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="genotype" render={({ field }) => ( <FormItem> <FormLabel>Genotype</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
                 <FormField control={form.control} name="allergies" render={({ field }) => ( <FormItem> <FormLabel>Allergies</FormLabel> <FormControl> <Textarea placeholder="e.g. Peanuts, Dust" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name="medicalConditions" render={({ field }) => ( <FormItem> <FormLabel>Existing Medical Conditions</FormLabel> <FormControl> <Textarea placeholder="e.g. Asthma" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <Separator />
                <p className="font-semibold text-sm text-muted-foreground">Emergency Contact (if different from guardian)</p>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="emergencyContactName" render={({ field }) => ( <FormItem> <FormLabel>Contact Name</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => ( <FormItem> <FormLabel>Contact Phone</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
                 <FormField control={form.control} name="relationToStudent" render={({ field }) => ( <FormItem> <FormLabel>Relationship to Student</FormLabel> <FormControl> <Input placeholder="e.g. Uncle, Family Doctor" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
            </CardContent>
         </Card>
        
        {/* Documents */}
        <Card>
            <CardHeader><CardTitle>Required Documents</CardTitle></CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="birthCertificate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Birth Certificate</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*,.pdf" onChange={(e) => field.onChange(e.target.files)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering Student...</> : <> <PlusCircle className="mr-2 h-4 w-4" /> Register New Student </>}
        </Button>
      </form>
    </Form>
  );
}
