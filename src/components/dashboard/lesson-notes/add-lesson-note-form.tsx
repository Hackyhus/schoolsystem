'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
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
import { db, storage } from '@/lib/firebase';
import { UploadCloud } from 'lucide-react';
import { useRole } from '@/context/role-context';
import { useState } from 'react';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  class: z.string().min(1, { message: 'Please select a class.' }),
  subject: z.string().min(1, { message: 'Please select a subject.' }),
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, 'File is required.'),
});

export function AddLessonNoteForm({
  onNoteAdded,
}: {
  onNoteAdded: () => void;
}) {
  const { user } = useRole();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef =
    React.useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      class: '',
      subject: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to submit a lesson note.',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const file = values.file[0];
      const storageRef = ref(
        storage,
        `lessonNotes/${user.uid}/${Date.now()}-${file.name}`
      );

      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      const newNoteRef = doc(collection(db, 'lessonNotes'));
      await setDoc(newNoteRef, {
        id: newNoteRef.id,
        title: values.title,
        class: values.class,
        subject: values.subject,
        fileUrl: downloadURL,
        storagePath: uploadResult.ref.fullPath,
        teacherId: user.uid,
        teacherName: user.displayName || 'Unknown Teacher',
        status: 'Pending HOD Approval',
        submissionDate: new Date().toLocaleDateString('en-CA'),
      });

      toast({
        title: 'Lesson Plan Submitted',
        description: 'Your lesson plan has been sent to your HOD for review.',
      });
      form.reset();
      if (fileRef.current) {
        fileRef.current.value = '';
      }
      onNoteAdded();
    } catch (e: any) {
      console.error('Error submitting lesson note: ', e);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description:
          e.message || 'There was a problem submitting your lesson note.',
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
              <FormLabel>Lesson Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Introduction to Algebra" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="JSS 1">JSS 1</SelectItem>
                    <SelectItem value="JSS 2">JSS 2</SelectItem>
                    <SelectItem value="SS 1">SS 1</SelectItem>
                    <SelectItem value="SS 2">SS 2</SelectItem>
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
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English Language">
                      English Language
                    </SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Plan Document</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf, .doc, .docx"
                  ref={fileRef}
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormDescription>
                Upload your lesson plan in PDF or Word format.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" /> Submit for Review
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
