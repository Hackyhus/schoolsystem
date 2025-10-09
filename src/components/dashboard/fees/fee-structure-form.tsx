
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { saveFeeStructure } from '@/actions/fee-actions';
import { useState } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { FeeStructure } from '@/lib/schema';
import { Separator } from '@/components/ui/separator';

const SESSIONS = ["2023/2024", "2024/2025", "2025/2026"];
const TERMS = ["First Term", "Second Term", "Third Term"];
export const CLASS_GROUPS = ["Pre-Nursery & Nursery", "Primary", "JSS", "SSS"];

const feeItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  amount: z.coerce.number().min(0, 'Amount must be a positive number.'),
});

const formSchema = z.object({
  id: z.string().optional(),
  className: z.string().min(1, 'Class group is required.'),
  session: z.string().min(1, 'Session is required.'),
  term: z.string().min(1, 'Term is required.'),
  items: z.array(feeItemSchema).min(1, 'At least one fee item is required.'),
});

type FeeStructureFormValues = z.infer<typeof formSchema>;

interface FeeStructureFormProps {
  initialData?: FeeStructure;
  onFormSubmit: (success: boolean) => void;
}

export function FeeStructureForm({ initialData, onFormSubmit }: FeeStructureFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeeStructureFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      session: SESSIONS[0],
      term: TERMS[0],
      items: [{ name: 'Tuition', amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (values: FeeStructureFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await saveFeeStructure(values);
      if (result.error) {
          Object.entries(result.error).forEach(([key, messages]) => {
              if (Array.isArray(messages)) {
                form.setError(key as keyof FeeStructureFormValues, { message: messages.join(', ') });
              }
          });
          throw new Error('Validation failed.');
      }
      toast({ title: 'Success', description: 'Fee structure saved successfully.' });
      onFormSubmit(true);
    } catch (error: any) {
      if (error.message !== 'Validation failed.') {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const totalAmount = form.watch('items').reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="className"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Class Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a class group" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {CLASS_GROUPS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Session</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Term</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            {TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        
        <Separator />

        <div>
            <h3 className="text-lg font-medium mb-2">Fee Items</h3>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                        <FormField
                            control={form.control}
                            name={`items.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Item Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Tuition Fee" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.amount`}
                            render={({ field }) => (
                                <FormItem className="w-48">
                                    <FormLabel>Amount (NGN)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 150000" {...field} />
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', amount: 0 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Fee Item
                </Button>
            </div>
             {form.formState.errors.items && (
                <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>
            )}
        </div>
        
        <Separator />

        <div className="flex items-center justify-between font-semibold text-lg bg-secondary/50 p-4 rounded-md">
            <span>Total Amount:</span>
            <span>NGN {totalAmount.toLocaleString()}</span>
        </div>


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={() => onFormSubmit(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {initialData ? 'Save Changes' : 'Create Structure'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
