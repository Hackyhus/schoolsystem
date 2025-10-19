
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
import { saveAnnouncement } from '@/actions/announcement-actions';
import { useState, useTransition } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { useRole } from '@/context/role-context';
import type { Announcement } from '@/lib/schema';
import { Separator } from '@/components/ui/separator';
import { aiEngine } from '@/ai';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
});

type AnnouncementFormValues = z.infer<typeof formSchema>;

interface AnnouncementFormProps {
  initialData?: Announcement;
  onFormSubmit: (success: boolean) => void;
}

export function AnnouncementForm({ initialData, onFormSubmit }: AnnouncementFormProps) {
  const { toast } = useToast();
  const { user } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerating, startAiTransition] = useTransition();
  const [aiTopic, setAiTopic] = useState('Announce a 3-day mid-term break starting next Monday.');
  const [aiError, setAiError] = useState('');


  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id,
      title: initialData?.title || '',
      content: initialData?.content || '',
    },
  });

  const onSubmit = async (values: AnnouncementFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsSubmitting(true);
    try {
      const result = await saveAnnouncement({ ...values, authorId: user.uid });
      if (result.error) {
          Object.entries(result.error).forEach(([key, messages]) => {
              if (Array.isArray(messages)) {
                form.setError(key as keyof AnnouncementFormValues, { message: messages.join(', ') });
              }
          });
          throw new Error('Validation failed.');
      }
      toast({ title: 'Success', description: 'Announcement saved successfully.' });
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
        
        <div className="space-y-2 rounded-lg border p-4">
            <h3 className="text-sm font-medium">AI Content Assistant (Coming Soon)</h3>
            <p className="text-xs text-muted-foreground">This feature is currently in development and will be available soon.</p>
             <Textarea
                placeholder="Enter a topic for the AI to expand on. e.g., Announce a 3-day mid-term break starting next Monday."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                rows={2}
                disabled
            />
            <Button type="button" disabled variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
            </Button>
        </div>


        <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Full Announcement Content</FormLabel>
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
            {initialData ? 'Save Changes' : 'Publish Announcement'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

    