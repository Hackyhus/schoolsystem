'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createAnnouncement } from '@/actions/announcement-actions';
import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useRole } from '@/context/role-context';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
});

type AnnouncementFormValues = z.infer<typeof formSchema>;

interface AnnouncementFormProps {
  onFormSubmit: (success: boolean) => void;
}

export function AnnouncementForm({ onFormSubmit }: AnnouncementFormProps) {
  const { toast } = useToast();
  const { user } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = async (values: AnnouncementFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsSubmitting(true);
    try {
      const result = await createAnnouncement({ ...values, authorId: user.uid });
      if (result.error) {
          Object.entries(result.error).forEach(([key, messages]) => {
              if (Array.isArray(messages)) {
                form.setError(key as keyof AnnouncementFormValues, { message: messages.join(', ') });
              }
          });
          throw new Error('Validation failed.');
      }
      toast({ title: 'Success', description: 'Announcement published successfully.' });
      onFormSubmit(true);
    } catch (error: any) {
      if (error.message !== 'Validation failed.') {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Mid-term Break Announcement" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                    <Textarea placeholder="Enter the full announcement details here..." {...field} rows={8} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={() => onFormSubmit(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Publish Announcement
          </Button>
        </div>
      </form>
    </Form>
  );
}
