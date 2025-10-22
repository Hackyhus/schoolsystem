
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { dbService } from '@/lib/dbService';
import type { Invoice, Payment } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, Search, CheckCircle, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { recordPayment, deletePayment } from '@/actions/payment-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DatePicker } from '@/components/ui/date-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRole } from '@/context/role-context';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amountPaid: z.coerce.number().positive('Payment amount must be positive'),
  paymentDate: z.date({ required_error: 'Payment date is required' }),
  paymentMethod: z.enum(['Bank Transfer', 'POS', 'Cash'], { required_error: 'Payment method is required' }),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const [invoiceIdToSearch, setInvoiceIdToSearch] = useState('');
  const [foundInvoice, setFoundInvoice] = useState<Invoice | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const { user } = useRole();

  const { toast } = useToast();
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: '',
      amountPaid: 0,
      paymentMethod: 'Bank Transfer',
      notes: '',
      paymentDate: undefined,
    }
  });

  const fetchRecentPayments = useCallback(async () => {
    setIsLoadingPayments(true);
    try {
        const payments = await dbService.getDocs<Payment>('payments', [
            { type: 'orderBy', fieldPath: 'paymentDate', direction: 'desc' },
            { type: 'limit', limitCount: 20 }
        ]);
        setRecentPayments(payments);
    } catch (error) {
        console.error("Error fetching recent payments:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch recent payments.' });
    } finally {
        setIsLoadingPayments(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchRecentPayments();
  }, [fetchRecentPayments]);


  const handleSearchInvoice = async () => {
    if (!invoiceIdToSearch) {
      setSearchError('Please enter an Invoice ID to search.');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setFoundInvoice(null);
    form.reset({
      paymentMethod: 'Bank Transfer',
      notes: '',
      amountPaid: 0,
      paymentDate: undefined,
      invoiceId: ''
    });

    try {
      const invoices = await dbService.getDocs<Invoice>('invoices', [
        { type: 'where', fieldPath: 'invoiceId', opStr: '==', value: invoiceIdToSearch.trim() },
        { type: 'limit', limitCount: 1 }
      ]);
      const invoice = invoices[0];
      if (invoice) {
        if (invoice.status === 'Paid') {
            setSearchError(`This invoice has already been fully paid.`);
        } else {
            setFoundInvoice(invoice);
            // Pass the custom invoice ID to the form, not the document ID
            form.setValue('invoiceId', invoice.invoiceId);
        }
      } else {
        setSearchError(`No invoice found with ID: ${invoiceIdToSearch}`);
      }
    } catch (error: any) {
      setSearchError(error.message || 'An error occurred during search.');
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (values: PaymentFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    try {
        const result = await recordPayment({ ...values, userId: user.uid });
        if(result.error) throw new Error(result.error);

        toast({
            title: 'Payment Recorded!',
            description: result.message,
            duration: 8000,
        });
        setFoundInvoice(null);
        setInvoiceIdToSearch('');
        form.reset();
        fetchRecentPayments();

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: error.message,
        });
    }
  }

  const handleDelete = async (paymentId: string) => {
    try {
      const result = await deletePayment(paymentId);
      if (result.error) {
        throw new Error(result.error);
      }
      toast({ title: 'Success', description: 'Payment record deleted successfully.' });
      fetchRecentPayments();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Record and track all fee payments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record New Payment</CardTitle>
          <CardDescription>Search for an invoice by its ID to record a payment against it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex gap-2">
                 <div className="flex-1">
                    <Label htmlFor="invoice-search">Invoice ID</Label>
                    <Input
                        id="invoice-search"
                        placeholder="e.g., INV-2024-00123"
                        value={invoiceIdToSearch}
                        onChange={(e) => setInvoiceIdToSearch(e.target.value)}
                        disabled={isSearching}
                    />
                 </div>
                 <Button onClick={handleSearchInvoice} disabled={isSearching || !invoiceIdToSearch} className="self-end">
                     {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search
                 </Button>
            </div>
            
            {searchError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{searchError}</AlertDescription></Alert>}
            
            {foundInvoice && (
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600"><CheckCircle /> Invoice Found</CardTitle>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <p><strong>Student:</strong> {foundInvoice.studentName}</p>
                            <p><strong>Class:</strong> {foundInvoice.class}</p>
                            <p><strong>Total Due:</strong> NGN {foundInvoice.totalAmount.toLocaleString()}</p>
                            <p><strong>Balance:</strong> NGN {foundInvoice.balance.toLocaleString()}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField control={form.control} name="amountPaid" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount Being Paid (NGN)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="paymentDate" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="mb-1">Payment Date</FormLabel>
                                            <DatePicker value={field.value} onChange={field.onChange} />
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Payment Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="POS">POS</SelectItem>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="notes" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes / Reference</FormLabel>
                                            <FormControl><Input placeholder="e.g., Transfer reference number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                 </div>

                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Record Payment
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>A log of the most recently recorded payments.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchRecentPayments} disabled={isLoadingPayments}>
                <RefreshCw className="h-4 w-4" />
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Amount Paid (NGN)</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {isLoadingPayments ? (
                        Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : recentPayments.length > 0 ? (
                        recentPayments.map(payment => (
                            <TableRow key={payment.id}>
                                <TableCell>
                                    <div className="font-medium">{payment.studentName}</div>
                                    <div className="text-xs text-muted-foreground">{payment.invoiceId}</div>
                                </TableCell>
                                <TableCell>{payment.amountPaid.toLocaleString()}</TableCell>
                                <TableCell><Badge variant="secondary">{payment.paymentMethod}</Badge></TableCell>
                                <TableCell>{format(new Date(payment.paymentDate.seconds * 1000), 'PPP')}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/receipts/${payment.id}`}>
                                            <Eye className="mr-2 h-4 w-4" /> View
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the payment record and reverse its effect on the invoice balance.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(payment.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                No payments have been recorded yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
