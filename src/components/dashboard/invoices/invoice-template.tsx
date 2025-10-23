
'use client';

import type { Invoice, SchoolInfo } from '@/lib/schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface InvoiceTemplateProps {
  invoice: Invoice;
  schoolInfo: SchoolInfo | null;
}

export function InvoiceTemplate({ invoice, schoolInfo }: InvoiceTemplateProps) {
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
        <div className="bg-white text-black font-serif">
             <style jsx global>{`
                @media print {
                  .printable-header-invoice, .printable-footer-invoice {
                    position: fixed;
                    width: 100%;
                    left: 0;
                    padding-left: 2rem;
                    padding-right: 2rem;
                    background-color: white;
                  }
                  .printable-header-invoice {
                    top: 0;
                  }
                  .printable-footer-invoice {
                    bottom: 0;
                  }
                  .printable-main-invoice {
                    padding-top: 150px; 
                    padding-bottom: 50px;
                  }
                }
            `}</style>
             <header className="printable-header-invoice p-8 text-center border-b-4 border-black pb-4">
                {schoolInfo?.logoUrl && (
                  <div className="flex justify-center mb-4">
                    <Image src={schoolInfo.logoUrl} alt="School Logo" width={250} height={60} className="h-20 w-auto object-contain" />
                  </div>
                )}
                <h1 className="text-4xl font-bold" style={{color: "hsl(var(--primary))"}}>{schoolInfo?.name || 'School Name'}</h1>
                <p className="text-sm text-gray-600 mt-1">{schoolInfo?.address}</p>
            </header>
            <main className="printable-main-invoice p-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-black">INVOICE</h2>
                    <p className="text-gray-500">{invoice.invoiceId}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                    <h3 className="font-bold text-gray-700">Bill To:</h3>
                    <p className="font-semibold text-lg">{invoice.studentName}</p>
                    <p>{invoice.class}</p>
                    <p>Student ID: {invoice.studentId}</p>
                    </div>
                    <div className="text-right">
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
                                    <TableCell className="text-right">NGN {(invoice.status === 'Paid' && invoice.balance === 0) ? invoice.totalAmount.toLocaleString() : invoice.amountPaid.toLocaleString()}</TableCell>
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
                    <p><strong>Bank Name:</strong> First Bank</p>
                    <p><strong>Account Name:</strong> {schoolInfo?.name || 'School Account Name'}</p>
                    <p><strong>Account Number:</strong> 2012345678</p>
                    <p>Use the Invoice ID as the payment reference.</p>
                </div>
            </main>
             <footer className="printable-footer-invoice p-8 text-center text-xs text-gray-500 border-t pt-4">
                <p>Phone: {schoolInfo?.phone} | Email: {schoolInfo?.email}</p>
            </footer>
        </div>
  );
}
