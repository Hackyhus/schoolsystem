
'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { db, storage, dbService } from '@/lib/firebase';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useRole } from '@/context/role-context';
import { useState, useEffect } from 'react';
import { useAcademicData } from '@/hooks/use-academic-data';
import type { MockLessonNote } from '@/lib/schema';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  type: z.enum(['Lesson Plan', 'Exam Question']),
  class: z.string().min(1, { message: 'Please select a class.' }),
  subject: z.string().min(1, { message: 'Please select a subject.' }),
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length >= 1, 'File is required.'),
});

// Update the schema for resubmissions, where the file is optional initially
// but we will still require it in the logic. This is for the form state.
const resubmissionSchema = formSchema.extend({
  file: z.instanceof(FileList).optional(),
});


export function AddLessonNoteForm({
  onNoteAdded,
  documentType,
  existingNoteData,
  isResubmission = false,
}: {
  onNoteAdded: () => void;
  documentType?: 'Lesson Plan' | 'Exam Question';
  existingNoteData?: MockLessonNote | null;
  isResubmission?: boolean;
}) {
  const { user } = useRole();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  const { classes, subjects, isLoading: isAcademicDataLoading } = useAcademicData();

  const currentSchema = isResubmission ? resubmissionSchema : formSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      title: existingNoteData?.title || '',
      type: documentType || 'Lesson Plan',
      class: existingNoteData?.class || '',
      subject: existingNoteData?.subject || '',
    },
  });

  useEffect(() => {
    if (documentType) {
        form.setValue('type', documentType);
    }
     if (isResubmission && existingNoteData) {
      form.reset({
        title: existingNoteData.title,
        class: existingNoteData.class,
        subject: existingNoteData.subject,
        type: documentType || 'Lesson Plan',
      });
    }
  }, [documentType, form, isResubmission, existingNoteData]);

  async function onSubmit(values: z.infer<typeof currentSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to submit a document.',
      });
      return;
    }

    if (!values.file || values.file.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'A file is required for submission.',
      });
      return;
    }


    setIsSubmitting(true);

    try {
      const file = values.file[0];
      const { type } = values;
      
      let collectionName = 'lessonNotes';
      let status = 'Pending HOD Approval';
      let reviewer = 'HeadOfDepartment';

      if (type === 'Exam Question') {
        collectionName = 'examQuestions';
        status = 'Pending Review';
        reviewer = 'Exam Officer';
      }

      const storageRef = ref(
        storage,
        `${collectionName}/${user.uid}/${Date.now()}-${file.name}`
      );

      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Fetch the user's profile from Firestore to get their full name
      const userDoc = await dbService.getDoc<{ name: string }>('users', user.uid);
      const teacherName = userDoc?.name || user.displayName || 'Unknown Teacher';


      if (isResubmission && existingNoteData) {
        // Update the existing document
        const docRef = doc(db, collectionName, existingNoteData.id);
        await updateDoc(docRef, {
          fileUrl: downloadURL,
          storagePath: uploadResult.ref.fullPath,
          status: status, // Reset status for re-review
          submittedOn: new Date(), // Update submission date
          admin_review: null, // Clear previous reviews
          hod_review: null,
        });
        toast({
          title: 'Document Resubmitted',
          description: `Your corrected ${type} has been sent for review.`,
        });
      } else {
        // Create a new document
         const newDocRef = doc(collection(db, collectionName));
        await setDoc(newDocRef, {
          id: newDocRef.id,
          title: values.title,
          class: values.class,
          subject: values.subject,
          fileUrl: downloadURL,
          storagePath: uploadResult.ref.fullPath,
          teacherId: user.uid,
          teacherName: teacherName,
          status: status,
          submissionDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
          submittedOn: new Date(),
          reviewer: reviewer,
        });

        toast({
          title: 'Document Submitted',
          description: `Your ${type} has been sent to the ${reviewer} for review.`,
        });
      }
      form.reset();
      if (fileRef.current) {
        fileRef.current.value = '';
      }
      onNoteAdded();
    } catch (e: any) {
      console.error('Error submitting document: ', e);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description:
          e.message || 'There was a problem submitting your document.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Week 1 - Introduction to Algebra" {...field} disabled={isResubmission} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!documentType || isResubmission}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Lesson Plan">Lesson Plan</SelectItem>
                        <SelectItem value="Exam Question">Exam Question</SelectItem>
                    </SelectContent>
                  </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isAcademicDataLoading || isResubmission}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isAcademicDataLoading ? "Loading..." : "Select Subject"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                   disabled={isAcademicDataLoading || isResubmission}
                >
                  <FormControl>
                    <SelectTrigger>
                       <SelectValue placeholder={isAcademicDataLoading ? "Loading..." : "Select Class"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     {classes.map(c => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isResubmission ? 'New Document File' : 'Document File'}</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf, .doc, .docx, .xls, .xlsx"
                  ref={fileRef}
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormDescription>
                {isResubmission ? 'Upload the corrected version of your document.' : 'Upload your document here. It will be routed to the correct reviewer.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
             <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" /> {isResubmission ? 'Resubmit for Review' : 'Submit for Review'}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
