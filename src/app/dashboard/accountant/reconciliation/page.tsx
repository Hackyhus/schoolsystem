
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, AlertCircle, FileCheck2, Scale, Search } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { dbService } from '@/lib/firebase';
import type { Payment } from '@/lib/schema';
import { addDays, differenceInDays, format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

type BankTransaction = {
  Date: Date;
  Description: string;
  Amount: number;
  __rowNum__: number;
};

type MatchedTransaction = {
  bankTx: BankTransaction;
  portalTx: Payment;
};

type ReconciliationResult = {
  matched: MatchedTransaction[];
  unmatchedBank: BankTransaction[];
  unmatchedPortal: Payment[];
};

export default function ReconciliationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setFileName(file.name);
        setReconciliationResult(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const bankTransactions: BankTransaction[] = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    dateNF: 'yyyy-mm-dd'
                });

                if (bankTransactions.length === 0) {
                    throw new Error("No transactions found in the file.");
                }

                if (!bankTransactions[0].Date || !bankTransactions[0].Amount) {
                    throw new Error("Invalid file format. Please ensure columns 'Date', 'Description', and 'Amount' exist.");
                }

                await runReconciliation(bankTransactions);
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'File Read Error',
                    description: error.message || 'Could not parse the uploaded file.',
                });
                setIsLoading(false);
                setFileName(null);
            }
        };
        reader.onerror = () => {
            toast({
                variant: 'destructive',
                title: 'File Read Error',
                description: 'There was a problem reading the file.',
            });
            setIsLoading(false);
            setFileName(null);
        };
        reader.readAsBinaryString(file);
    };

    const runReconciliation = async (bankTransactions: BankTransaction[]) => {
        const validBankTxs = bankTransactions.filter(tx => tx.Amount > 0);
        if (validBankTxs.length === 0) {
            toast({ title: "No credit transactions found", description: "The statement contains no incoming payments to reconcile." });
            setIsLoading(false);
            return;
        }

        const dates = validBankTxs.map(tx => tx.Date).sort((a, b) => a.getTime() - b.getTime());
        const minDate = dates[0];
        const maxDate = addDays(dates[dates.length - 1], 1); // Add a day for buffer

        try {
            const portalPayments = await dbService.getDocs<Payment>('payments', [
                { type: 'where', fieldPath: 'paymentDate', opStr: '>=', value: minDate },
                { type: 'where', fieldPath: 'paymentDate', opStr: '<=', value: maxDate },
            ]);
            
            const result: ReconciliationResult = {
                matched: [],
                unmatchedBank: [],
                unmatchedPortal: [...portalPayments]
            };

            for (const bankTx of validBankTxs) {
                let foundMatch = false;
                for (let i = 0; i < result.unmatchedPortal.length; i++) {
                    const portalTx = result.unmatchedPortal[i];
                    const portalDate = new Date(portalTx.paymentDate.seconds * 1000);
                    
                    const amountMatches = portalTx.amountPaid === bankTx.Amount;
                    const dateDifference = Math.abs(differenceInDays(bankTx.Date, portalDate));

                    if (amountMatches && dateDifference <= 2) { // Match if same amount within a 2-day window
                        result.matched.push({ bankTx, portalTx });
                        result.unmatchedPortal.splice(i, 1); // Remove from unmatched
                        foundMatch = true;
                        break; 
                    }
                }
                if (!foundMatch) {
                    result.unmatchedBank.push(bankTx);
                }
            }

            setReconciliationResult(result);
            toast({ title: 'Reconciliation Complete', description: 'Review the matched and unmatched transactions below.' });

        } catch (error: any) {
            console.error("Error during reconciliation:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch portal payment records.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const totalMatched = reconciliationResult?.matched.reduce((sum, item) => sum + item.bankTx.Amount, 0) || 0;
    const totalUnmatchedBank = reconciliationResult?.unmatchedBank.reduce((sum, item) => sum + item.Amount, 0) || 0;
    const totalUnmatchedPortal = reconciliationResult?.unmatchedPortal.reduce((sum, item) => sum + item.amountPaid, 0) || 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Bank Reconciliation</h1>
                <p className="text-muted-foreground">
                    Upload a bank statement to reconcile against payments recorded in the portal.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Automated Reconciliation Tool</CardTitle>
                    <CardDescription>
                        Upload a CSV or Excel file containing your bank transactions. The system requires columns named 'Date', 'Description', and 'Amount'.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                        <Input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileSelect}
                            disabled={isLoading}
                        />
                         <div className="mb-4">
                            {isLoading ? (
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            ) : (
                                <FileCheck2 className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold">{fileName || "Upload Your Bank Statement"}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                           {isLoading ? "Processing file, please wait..." : "Only credit transactions will be reconciled."}
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {fileName ? 'Upload Different File' : 'Choose File'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {reconciliationResult && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Reconciliation Summary</CardTitle>
                        <CardDescription>Results from the comparison between the bank statement and portal records.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
                            <CardHeader>
                                <CardTitle>NGN {totalMatched.toLocaleString()}</CardTitle>
                                <CardDescription>Matched Transactions</CardDescription>
                            </CardHeader>
                        </Card>
                         <Card className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800">
                            <CardHeader>
                                <CardTitle>NGN {totalUnmatchedBank.toLocaleString()}</CardTitle>
                                <CardDescription>Unmatched from Bank</CardDescription>
                            </CardHeader>
                        </Card>
                         <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <CardTitle>NGN {totalUnmatchedPortal.toLocaleString()}</CardTitle>
                                <CardDescription>Unmatched from Portal</CardDescription>
                            </CardHeader>
                        </Card>
                    </CardContent>
                 </Card>
            )}

            {reconciliationResult && (
                <Tabs defaultValue="matched">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="matched">Matched ({reconciliationResult.matched.length})</TabsTrigger>
                        <TabsTrigger value="unmatched-bank">Unmatched from Bank ({reconciliationResult.unmatchedBank.length})</TabsTrigger>
                        <TabsTrigger value="unmatched-portal">Unmatched from Portal ({reconciliationResult.unmatchedPortal.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="matched">
                        <Card>
                            <CardHeader><CardTitle>Matched Transactions</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Portal Date</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Bank Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reconciliationResult.matched.map(({ portalTx, bankTx }) => (
                                            <TableRow key={portalTx.id}>
                                                <TableCell>{format(new Date(portalTx.paymentDate.seconds * 1000), 'PPP')}</TableCell>
                                                <TableCell>{portalTx.studentName}</TableCell>
                                                <TableCell className="font-medium">NGN {portalTx.amountPaid.toLocaleString()}</TableCell>
                                                <TableCell>{format(bankTx.Date, 'PPP')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="unmatched-bank">
                        <Card>
                            <CardHeader><CardTitle>Unmatched from Bank Statement</CardTitle><CardDescription>These transactions appeared on the bank statement but have no corresponding record in the portal.</CardDescription></CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Bank Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reconciliationResult.unmatchedBank.map(tx => (
                                            <TableRow key={tx.__rowNum__}>
                                                <TableCell>{format(tx.Date, 'PPP')}</TableCell>
                                                <TableCell>{tx.Description}</TableCell>
                                                <TableCell className="font-medium">NGN {tx.Amount.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="unmatched-portal">
                         <Card>
                            <CardHeader><CardTitle>Unmatched from Portal Records</CardTitle><CardDescription>These payments were recorded in the portal but could not be found on the bank statement for the period.</CardDescription></CardHeader>
                            <CardContent>
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Portal Date</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Amount</TableHead>
                                             <TableHead>Method</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reconciliationResult.unmatchedPortal.map(tx => (
                                            <TableRow key={tx.id}>
                                                 <TableCell>{format(new Date(tx.paymentDate.seconds * 1000), 'PPP')}</TableCell>
                                                <TableCell>{tx.studentName}</TableCell>
                                                <TableCell className="font-medium">NGN {tx.amountPaid.toLocaleString()}</TableCell>
                                                <TableCell><Badge variant="secondary">{tx.paymentMethod}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
