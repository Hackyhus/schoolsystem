
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfMonth } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import { dbService } from '@/lib/firebase';
import type { Payment, Expense } from '@/lib/schema';
import { ArrowDown, ArrowUp, BarChart, FileText, Loader2, Minus, Plus, Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type ReportData = {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    payments: Payment[];
    expenses: Expense[];
    expenseByCategory: { name: string; total: number }[];
}

export function FinancialReportGenerator() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const { toast } = useToast();
    
    const chartConfig = {
      total: { label: 'Expenses', color: 'hsl(var(--chart-1))' },
    };

    const handleGenerateReport = async () => {
        if (!date?.from || !date?.to) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a valid date range.' });
            return;
        }

        setIsLoading(true);
        setReportData(null);

        try {
            const fromDate = date.from;
            const toDate = addDays(date.to, 1); // Include the whole end day

            const [payments, expenses] = await Promise.all([
                dbService.getDocs<Payment>('payments', [
                    { type: 'where', fieldPath: 'paymentDate', opStr: '>=', value: fromDate },
                    { type: 'where', fieldPath: 'paymentDate', opStr: '<', value: toDate },
                ]),
                dbService.getDocs<Expense>('expenses', [
                    { type: 'where', fieldPath: 'date', opStr: '>=', value: fromDate },
                    { type: 'where', fieldPath: 'date', opStr: '<', value: toDate },
                ])
            ]);

            const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
            const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
            
            const expenseByCategory = expenses.reduce((acc, expense) => {
                const category = acc.find(item => item.name === expense.category);
                if (category) {
                    category.total += expense.amount;
                } else {
                    acc.push({ name: expense.category, total: expense.amount });
                }
                return acc;
            }, [] as { name: string; total: number }[]);

            setReportData({
                totalRevenue,
                totalExpenses,
                netIncome: totalRevenue - totalExpenses,
                payments, // Store all payments
                expenses, // Store all expenses
                expenseByCategory
            });

            toast({ title: 'Report Generated', description: 'Financial report for the selected period is ready.' });

        } catch (error: any) {
            console.error("Error generating report:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate the report.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePrintReport = () => {
        window.print();
    };

    const netIncomeColor = reportData && reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600';
    const reportTitle = `Financial Report: ${date?.from ? format(date.from, 'PPP') : ''} - ${date?.to ? format(date.to, 'PPP') : ''}`;


    return (
        <div className="space-y-6 print:space-y-0">
            <Card className="print:hidden">
                <CardHeader>
                    <CardTitle>Generate Financial Report</CardTitle>
                    <CardDescription>Select a date range to generate an income statement and expense report.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <DateRangePicker date={date} setDate={setDate} />
                    <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        Generate Report
                    </Button>
                    {reportData && (
                        <Button onClick={handlePrintReport} variant="outline" className="w-full sm:w-auto">
                            <Printer className="mr-2 h-4 w-4" />
                            Print Report
                        </Button>
                    )}
                </CardContent>
            </Card>

            {isLoading && <Skeleton className="h-96 w-full" />}

            {reportData && (
                <div id="print-area" className="space-y-6">
                     <div className="hidden print:block text-center mb-8">
                        <h1 className="text-2xl font-bold">Great Insight International Academy</h1>
                        <h2 className="text-xl font-semibold">{reportTitle}</h2>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Income Statement</CardTitle>
                            <CardDescription className="print:hidden">
                                Financial summary for the period from {format(date?.from!, 'PPP')} to {format(date?.to!, 'PPP')}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="flex items-center gap-4 rounded-lg border p-4 bg-green-50 dark:bg-green-900/30">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                                    <ArrowUp className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-2xl font-bold">NGN {reportData.totalRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 rounded-lg border p-4 bg-red-50 dark:bg-red-900/30">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                                    <ArrowDown className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                                    <p className="text-2xl font-bold">NGN {reportData.totalExpenses.toLocaleString()}</p>
                                </div>
                            </div>
                             <div className={`flex items-center gap-4 rounded-lg border p-4 ${reportData.netIncome >= 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
                                 <div className={`flex h-12 w-12 items-center justify-center rounded-full ${reportData.netIncome >= 0 ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-orange-100 dark:bg-orange-900/50'}`}>
                                    {reportData.netIncome >= 0 ? <Plus className="h-6 w-6 text-blue-500" /> : <Minus className="h-6 w-6 text-orange-500" />}
                                 </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Net Income</p>
                                    <p className={`text-2xl font-bold ${netIncomeColor}`}>NGN {reportData.netIncome.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                     </Card>

                     <Card className="print:hidden">
                        <CardHeader>
                            <CardTitle>Expense Breakdown</CardTitle>
                            <CardDescription>Visual breakdown of expenses by category.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={chartConfig} className="w-full h-[300px]">
                                <RechartsBarChart data={reportData.expenseByCategory} accessibilityLayer>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" height={60} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                                </RechartsBarChart>
                             </ChartContainer>
                        </CardContent>
                     </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Income Transactions</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {reportData.payments.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.studentName}</TableCell>
                                                <TableCell>NGN {p.amountPaid.toLocaleString()}</TableCell>
                                                <TableCell>{format(new Date(p.paymentDate.seconds*1000), 'PPP')}</TableCell>
                                            </TableRow>
                                        ))}
                                        {reportData.payments.length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">No income recorded in this period.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Expense Transactions</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {reportData.expenses.map(e => (
                                            <TableRow key={e.id}>
                                                <TableCell>{e.description}</TableCell>
                                                <TableCell>NGN {e.amount.toLocaleString()}</TableCell>
                                                <TableCell>{format(new Date(e.date.seconds*1000), 'PPP')}</TableCell>
                                            </TableRow>
                                        ))}
                                         {reportData.expenses.length === 0 && <TableRow><TableCell colSpan={3} className="text-center h-24">No expenses recorded in this period.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
            <style jsx global>{`
                @media print {
                  body > *:not(#print-area) {
                    display: none;
                  }
                  #print-area, #print-area * {
                    visibility: visible;
                  }
                  #print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                  .print\\:hidden {
                      display: none;
                  }
                   .print\\:block {
                      display: block;
                  }
                  .print\\:grid-cols-2 {
                      grid-template-columns: repeat(2, minmax(0, 1fr));
                  }
                   .print\\:space-y-0 {
                        row-gap: 0;
                   }
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                }
            `}</style>
        </div>
    )
}
