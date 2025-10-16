
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Sparkles, AlertCircle } from 'lucide-react';
import { dbService } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const HARM_CATEGORIES = [
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_HARASSMENT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
] as const;

const THRESHOLDS = [
  'BLOCK_NONE',
  'BLOCK_ONLY_HIGH',
  'BLOCK_MEDIUM_AND_ABOVE',
  'BLOCK_LOW_AND_ABOVE',
] as const;

const safetySettingSchema = z.object({
  category: z.enum(HARM_CATEGORIES),
  threshold: z.enum(THRESHOLDS),
});

const formSchema = z.object({
  safetySettings: z.array(safetySettingSchema),
});

type FormValues = z.infer<typeof formSchema>;
type SafetySettings = z.infer<typeof safetySettingSchema>[];

export default function AISettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      safetySettings: HARM_CATEGORIES.map(category => ({
        category,
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      })),
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await dbService.getDoc<{ safetySettings?: SafetySettings }>('system', 'aiConfig');
        if (settings?.safetySettings) {
          form.setValue('safetySettings', settings.safetySettings);
        }
      } catch (error) {
        console.error("Failed to fetch AI settings:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load AI configuration.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (values: FormValues) => {
    try {
      await dbService.setDoc('system', 'aiConfig', values);
      toast({ title: 'Success', description: 'AI safety settings have been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save AI settings.' });
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace('HARM_CATEGORY_', '').replace(/_/g, ' ');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Sparkles /> AI Engine Configuration
        </h1>
        <p className="text-muted-foreground">
          Manage and configure the behavior of the AI agents used across the portal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Safety Settings</CardTitle>
          <CardDescription>
            Adjust the content safety filters for the AI model. These settings help block potentially harmful content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How It Works</AlertTitle>
            <AlertDescription>
              Select a threshold for each category. 'BLOCK_NONE' is the most permissive, while 'BLOCK_LOW_AND_ABOVE' is the strictest. Changes will apply to all new AI generations.
            </AlertDescription>
          </Alert>
          
          {isLoading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                <div className="space-y-4 rounded-md border p-4">
                    {form.getValues('safetySettings').map((setting, index) => (
                        <FormField
                            key={setting.category}
                            control={form.control}
                            name={`safetySettings.${index}.threshold`}
                            render={({ field }) => (
                                <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <FormLabel className="font-semibold capitalize">{getCategoryLabel(setting.category)}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full sm:w-[240px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {THRESHOLDS.map(t => (
                                                <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Settings
                    </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
