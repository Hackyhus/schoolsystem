
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/lib/firebase';
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

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

export default function PayrollPage() {
    const [staff, setStaff] = useState<MockUser[]>([]);
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(YEARS[0]);

    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const allUsers = await dbService.getDocs<MockUser>('users', [
                { type: 'where', fieldPath: 'status', opStr: '==', value: 'active' },
                { type: 'where', fieldPath: 'salary.amount', opStr: '>', value: 0 }
            ]);
            
            const runsData = await dbService.getDocs<PayrollRun>('payrollRuns', [
                { type: 'orderBy', fieldPath: 'executedAt', direction: 'desc' }
            ]);
            
            setStaff(allUsers);
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
        setIsProcessing(true);
        try {
            const result = await runPayroll(selectedMonth, selectedYear);
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
    
    const totalSalary = staff.reduce((acc, user) => acc + (user.salary?.amount || 0), 0);

    return (
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
                    <CardDescription>Select a period to execute the payroll for all eligible staff members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                            This action will generate payslips for all active staff with a configured salary. It cannot be undone for the selected month.
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
                                <Button size="lg" className="w-full sm:w-auto" disabled={isProcessing || isLoading || staff.length === 0}>
                                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
                                    Run Payroll for {selectedMonth} {selectedYear}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Payroll Execution</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You are about to run payroll for <span className="font-bold">{selectedMonth} {selectedYear}</span> for <span className="font-bold">{staff.length} staff members</span>, with a total amount of <span className="font-bold">NGN {totalSalary.toLocaleString()}</span>. This action is irreversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRunPayroll}>Confirm & Run</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Payroll Summary</CardTitle>
                        <CardDescription>List of all active staff with a configured salary amount.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff Name</TableHead>
                                    <TableHead className="text-right">Salary (NGN)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}><TableCell><Skeleton className="h-5 w-32"/></TableCell><TableCell><Skeleton className="h-5 w-24 ml-auto"/></TableCell></TableRow>
                                )) : staff.length > 0 ? staff.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell className="text-right font-medium">{user.salary?.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={2} className="h-24 text-center text-muted-foreground">No staff with active salaries found.</TableCell></TableRow>
                                )}
                                <TableRow className="font-bold bg-secondary/50">
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right">{totalSalary.toLocaleString()}</TableCell>
                                </TableRow>
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
        </div>
    );
}
