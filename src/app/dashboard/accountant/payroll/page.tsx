
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Loader2, RefreshCw, AlertCircle, CheckCircle, Edit } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/lib/dbService';
import type { MockUser, PayrollRun } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { runPayroll } from '@/actions/payroll-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRole } from '@/context/role-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BankDetailsForm } from '@/components/dashboard/profile/bank-details-form';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = [new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() - 1];

export default function PayrollPage() {
    const [staff, setStaff] = useState<MockUser[]>([]);
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(YEARS[0]);
    const [editingUser, setEditingUser] = useState<MockUser | null>(null);

    const { user } = useRole();
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const allUsers = await dbService.getDocs<MockUser>('users', [
              { type: 'where', fieldPath: 'status', opStr: '==', value: 'active' }
            ]);
            
            // Filter for active staff with a salary object where amount is a number.
            const eligibleStaff = allUsers.filter(
              (user) => user.salary && typeof user.salary.amount === 'number'
            );
            
            const runsData = await dbService.getDocs<PayrollRun>('payrollRuns', [
                { type: 'orderBy', fieldPath: 'executedAt', direction: 'desc' }
            ]);
            
            setStaff(eligibleStaff);
            setPayrollRuns(runsData);
        } catch (error) {
            console.error('Error fetching payroll data:', error);
            toast({
                variant: 'destructive',
                title: 'Error fetching data',
                description: 'Could not load staff salary or payroll history.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRunPayroll = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }
        setIsProcessing(true);
        try {
            const result = await runPayroll(selectedMonth, selectedYear, user.uid);
            if(result.error) throw new Error(result.error);
            
            toast({
                title: 'Payroll Executed Successfully!',
                description: `Payroll for ${result.employeeCount} employees, totaling NGN ${result.totalAmount?.toLocaleString()}, has been processed.`,
                duration: 7000
            });
            fetchData(); // Refresh all data

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Payroll Execution Failed',
                description: error.message,
                duration: 9000,
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleEditUser = (user: MockUser) => {
        setEditingUser(user);
    };

    const handleUpdateComplete = () => {
        setEditingUser(null);
        fetchData();
    };

    const staffForPayrollRun = staff.filter(user => user.salary && user.salary.amount > 0);
    const totalSalary = staffForPayrollRun.reduce((acc, user) => acc + (user.salary?.amount || 0), 0);

    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
            <div className="space-y-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Payroll</h1>
                    <p className="text-muted-foreground">
                        Manage staff salaries and generate payslips.
                    </p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Run Monthly Payroll</CardTitle>
                        <CardDescription>Select a period to execute the payroll for all eligible staff members with a configured salary greater than zero.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Important</AlertTitle>
                            <AlertDescription>
                                This action will generate payslips for all active staff with a configured salary greater than zero. It cannot be undone for the selected month.
                            </AlertDescription>
                        </Alert>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                                <Select onValueChange={setSelectedMonth} value={selectedMonth} disabled={isProcessing}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={(val) => setSelectedYear(Number(val))} value={String(selectedYear)} disabled={isProcessing}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="lg" className="w-full sm:w-auto" disabled={isProcessing || isLoading || staffForPayrollRun.length === 0}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
                                        Run Payroll for {selectedMonth} {selectedYear}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Payroll Execution</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You are about to run payroll for <span className="font-bold">{selectedMonth} {selectedYear}</span> for <span className="font-bold">{staffForPayrollRun.length} staff members</span>, with a total amount of <span className="font-bold">NGN {totalSalary.toLocaleString()}</span>. This action is irreversible.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleRunPayroll}>Confirm & Run</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        {isLoading && (<div className="text-sm text-muted-foreground">Loading staff data...</div>)}
                        {!isLoading && staffForPayrollRun.length === 0 && (<div className="text-sm text-muted-foreground">No staff with active salaries greater than zero found for the upcoming payroll run. Please configure salaries in the staff management section.</div>)}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Salary & Bank Details Management</CardTitle>
                            <CardDescription>List of all active staff with a configured salary amount.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Staff Name</TableHead>
                                        <TableHead className="text-right">Salary (NGN)</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i}><TableCell><Skeleton className="h-5 w-32"/></TableCell><TableCell><Skeleton className="h-5 w-24 ml-auto"/></TableCell><TableCell><Skeleton className="h-8 w-16 ml-auto"/></TableCell></TableRow>
                                    )) : staff.length > 0 ? staff.map(user => (
                                        <TableRow key={user.id} className={user.salary?.amount === 0 ? 'text-muted-foreground' : ''}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell className="text-right font-medium">{user.salary?.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </Button>
                                                </DialogTrigger>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No active staff found.</TableCell></TableRow>
                                    )}
                                    {!isLoading && staffForPayrollRun.length > 0 && (
                                        <TableRow className="font-bold bg-secondary/50">
                                            <TableCell>Total (for salaries > 0)</TableCell>
                                            <TableCell className="text-right">{totalSalary.toLocaleString()}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Payroll History</CardTitle>
                                <CardDescription>Log of all past payroll executions.</CardDescription>
                            </div>
                            <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}><RefreshCw className="h-4 w-4"/></Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pay Period</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Executed At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i}><TableCell><Skeleton className="h-5 w-24"/></TableCell><TableCell><Skeleton className="h-5 w-24"/></TableCell><TableCell><Skeleton className="h-5 w-28"/></TableCell></TableRow>
                                    )) : payrollRuns.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">No payroll has been run yet.</TableCell></TableRow>
                                    ) : payrollRuns.map(run => (
                                        <TableRow key={run.id}>
                                            <TableCell className="font-semibold">{run.month} {run.year}</TableCell>
                                            <TableCell>NGN {run.totalAmount.toLocaleString()}</TableCell>
                                            <TableCell>{format(new Date(run.executedAt.seconds * 1000), 'PPP p')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                 {editingUser && (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Salary for {editingUser.name}</DialogTitle>
                        </DialogHeader>
                        <BankDetailsForm user={editingUser} onUpdate={handleUpdateComplete} />
                    </DialogContent>
                )}
            </div>
        </Dialog>
    );
}
