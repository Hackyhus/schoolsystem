
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Landmark, Wallet, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useCallback } from "react";
import { dbService } from "@/lib/dbService";
import type { Invoice, Payment, Expense, PayrollRun } from "@/lib/schema";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

type FinancialStats = {
    revenueThisTerm: number;
    outstandingReceivables: number;
    pendingInvoices: number;
    nextPayroll: number;
};

export default function AccountantPage() {
    const [stats, setStats] = useState<FinancialStats | null>(null);
    const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    // A simplified term detection. In a real app, this would come from system settings.
    const getCurrentTerm = () => "First Term";

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentTerm = getCurrentTerm();

            // Fetch all invoices to calculate receivables and pending count
            const allInvoices = await dbService.getDocs<Invoice>('invoices');
            const outstandingReceivables = allInvoices
                .filter(inv => inv.status === 'Unpaid' || inv.status === 'Partially Paid')
                .reduce((sum, inv) => sum + inv.balance, 0);
            const pendingInvoices = allInvoices.filter(inv => inv.status === 'Unpaid').length;

            // Fetch payments for the current term
            const termPayments = allInvoices
                .filter(inv => inv.term === currentTerm && inv.status !== 'Unpaid')
                .reduce((sum, inv) => sum + inv.amountPaid, 0);

            // Fetch payroll data
            const staffWithSalary = await dbService.getDocs<{salary: {amount:number}}>('users', [
                { type: 'where', fieldPath: 'salary.amount', opStr: '>', value: 0 }
            ]);
            const nextPayroll = staffWithSalary.reduce((sum, staff) => sum + staff.salary.amount, 0);
            
            // Fetch recent transactions
            const [payments, expenses] = await Promise.all([
                 dbService.getDocs<Payment>('payments', [{type: 'orderBy', fieldPath: 'paymentDate', direction: 'desc'}, {type: 'limit', limitCount: 5}]),
                 dbService.getDocs<Expense>('expenses', [{type: 'orderBy', fieldPath: 'date', direction: 'desc'}, {type: 'limit', limitCount: 5}])
            ]);

            setStats({
                revenueThisTerm: termPayments,
                outstandingReceivables,
                pendingInvoices,
                nextPayroll,
            });
            setRecentPayments(payments);
            setRecentExpenses(expenses);

        } catch (error) {
            console.error("Failed to fetch accountant dashboard data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load financial data.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const renderStat = (value: number, isCurrency = true) => {
        if (isLoading) return <Skeleton className="h-8 w-24" />;
        if (isCurrency) return `NGN ${value.toLocaleString()}`;
        return value.toLocaleString();
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Accountant Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage all financial operations for the school.
                </p>
            </div>
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Fees Collected (This Term)
                    </CardTitle>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{renderStat(stats?.revenueThisTerm ?? 0)}</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Outstanding Receivables
                    </CardTitle>
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold">{renderStat(stats?.outstandingReceivables ?? 0)}</div>
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Unpaid Invoices
                    </CardTitle>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{renderStat(stats?.pendingInvoices ?? 0, false)}</div>
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Next Payroll Estimate
                    </CardTitle>
                    <Landmark className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{renderStat(stats?.nextPayroll ?? 0)}</div>
                </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                        A log of the most recent financial activities.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="payments">
                        <TabsList>
                            <TabsTrigger value="payments">Recent Payments</TabsTrigger>
                            <TabsTrigger value="expenses">Recent Expenses</TabsTrigger>
                        </TabsList>
                        <TabsContent value="payments" className="pt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? Array.from({length: 3}).map((_,i) => (
                                         <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full"/></TableCell></TableRow>
                                    )) : recentPayments.length > 0 ? recentPayments.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <div className="font-medium">{p.studentName}</div>
                                                <div className="text-xs text-muted-foreground">{format(new Date(p.paymentDate.seconds * 1000), 'PPP')}</div>
                                            </TableCell>
                                            <TableCell>NGN {p.amountPaid.toLocaleString()}</TableCell>
                                            <TableCell><Badge variant="secondary">{p.paymentMethod}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/dashboard/receipts/${p.id}`}><Eye className="mr-2 h-4 w-4"/> View</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No recent payments.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </TabsContent>
                         <TabsContent value="expenses" className="pt-4">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {isLoading ? Array.from({length: 3}).map((_,i) => (
                                         <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full"/></TableCell></TableRow>
                                    )) : recentExpenses.length > 0 ? recentExpenses.map(e => (
                                        <TableRow key={e.id}>
                                            <TableCell>{e.description}</TableCell>
                                            <TableCell>NGN {e.amount.toLocaleString()}</TableCell>
                                            <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                                            <TableCell>{format(new Date(e.date.seconds * 1000), 'PPP')}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No recent expenses.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                         </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
