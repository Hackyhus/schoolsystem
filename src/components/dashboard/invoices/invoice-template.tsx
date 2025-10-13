
'use client';

import type { Invoice } from '@/lib/schema';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface InvoiceTemplateProps {
  invoice: Invoice;
}

export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
    const getStatusVariant = (status: Invoice['status']) => {
        switch (status) {
            case 'Paid': return 'default';
            case 'Unpaid': return 'secondary';
            case 'Overdue': return 'destructive';
            default: return 'outline';
        }
    };
    const dueDate = invoice.dueDate?.seconds ? format(new Date(invoice.dueDate.seconds * 1000), 'PPP') : 'N/A';

  return (
    <div style={{ width: '8.27in' }} className="bg-white">
        <div id="pdf-content" className="w-full mx-auto p-8 bg-white text-black">
             <header className="flex flex-col md:flex-row items-center justify-between border-b-4 border-black pb-4 text-center md:text-left">
                <div className="flex items-center gap-4">
                <Image src="/school-logo.png" alt="School Logo" width={250} height={60} className="h-16 w-auto" />
                </div>
                <div className="mt-4 md:mt-0 md:text-right">
                <h2 className="text-4xl font-bold text-black">INVOICE</h2>
                <p className="text-gray-500">{invoice.invoiceId}</p>
                </div>
            </header>
            <main>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 text-sm">
                    <div>
                    <h3 className="font-bold text-gray-700">Bill To:</h3>
                    <p className="font-semibold text-lg">{invoice.studentName}</p>
                    <p>{invoice.class}</p>
                    <p>Student ID: {invoice.studentId}</p>
                    </div>
                    <div className="md:text-right">
                    <p><strong>Issue Date:</strong> {format(new Date(invoice.createdAt.seconds * 1000), 'PPP')}</p>
                    <p><strong>Due Date:</strong> {dueDate}</p>
                    <Badge variant={getStatusVariant(invoice.status)} className="mt-2 text-lg px-4 py-1">{invoice.status}</Badge>
                    </div>
                </div>

                <div className="overflow-x-auto mt-8">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="font-bold text-black">Item Description</TableHead>
                            <TableHead className="text-right font-bold text-black">Amount (NGN)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items.map((item, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                                <TableCell className="font-medium text-black">{item.name}</TableCell>
                                <TableCell className="text-right text-black">{item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="text-lg font-bold bg-gray-100">
                                <TableCell className="text-black">Total Amount Due</TableCell>
                                <TableCell className="text-right text-black">NGN {invoice.totalAmount.toLocaleString()}</TableCell>
                            </TableRow>
                            {invoice.status !== 'Unpaid' && (
                                <>
                                 <TableRow className="text-base font-medium">
                                    <TableCell>Amount Paid</TableCell>
                                    <TableCell className="text-right">NGN {invoice.amountPaid.toLocaleString()}</TableCell>
                                </TableRow>
                                <TableRow className="text-base font-bold bg-gray-100">
                                    <TableCell>Balance</TableCell>
                                    <TableCell className="text-right">NGN {invoice.balance.toLocaleString()}</TableCell>
                                </TableRow>
                                </>
                            )}
                        </TableFooter>
                    </Table>
                </div>
                 <Separator className="my-6 bg-gray-300" />
                 <div className="text-sm text-gray-600 space-y-2">
                    <h4 className="font-bold text-base text-black">Payment Instructions:</h4>
                    <p>Please make payments to the following bank account:</p>
                    <p><strong>Bank Name:</strong> First Bank of Nigeria</p>
                    <p><strong>Account Name:</strong> Great Insight International Academy</p>
                    <p><strong>Account Number:</strong> 2012345678</p>
                    <p>Use the Invoice ID as the payment reference.</p>
                </div>
            </main>
             <footer id="pdf-footer-container" className="mt-12 text-center text-xs text-gray-500 border-t pt-4">
                <p className="font-bold">Great Insight International Academy</p>
                <p>123 Education Lane, Knowledge City</p>
                <p>Phone: (123) 456-7890 | Email: info@giia.com.ng</p>
            </footer>
        </div>
        
        <style jsx global>{`
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .print\\:hidden { display: none; }
              .print\\:shadow-none { box-shadow: none; }
              .print\\:border-0 { border: 0; }
            }
        `}</style>
    </div>
  );
}
