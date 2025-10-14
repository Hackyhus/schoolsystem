
'use client';

import type { Payment, SchoolInfo } from '@/lib/schema';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { format } from 'date-fns';

interface ReceiptTemplateProps {
  payment: Payment;
  schoolInfo: SchoolInfo | null;
}

export function ReceiptTemplate({ payment, schoolInfo }: ReceiptTemplateProps) {
  const paymentDate = payment.paymentDate?.seconds ? format(new Date(payment.paymentDate.seconds * 1000), 'PPP') : 'N/A';

  return (
      <div id="pdf-content" className="max-w-4xl mx-auto p-8 bg-white text-black font-serif">
        <header className="text-center border-b-4 border-black pb-4">
          {schoolInfo?.logoUrl && (
            <div className="flex justify-center mb-4">
              <Image src={schoolInfo.logoUrl} alt="School Logo" width={250} height={60} className="h-20 w-auto object-contain" />
            </div>
          )}
          <h1 className="text-4xl font-bold text-primary">{schoolInfo?.name || 'School Name'}</h1>
          <p className="text-sm text-gray-600 mt-1">{schoolInfo?.address}</p>
        </header>

        <main className="py-8">
           <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-black">PAYMENT RECEIPT</h2>
              <p className="text-gray-500">Receipt No: {payment.id}</p>
           </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-8">
            <div>
              <h3 className="font-bold text-gray-700">Received From:</h3>
              <p className="font-semibold text-lg">{payment.studentName}</p>
              <p>For Invoice: {payment.invoiceId}</p>
            </div>
            <div className="text-right">
              <p><strong>Payment Date:</strong> {paymentDate}</p>
              <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
            </div>
          </div>
          
          <div className="text-center my-10">
              <p className="text-lg text-gray-600">Amount Paid</p>
              <p className="text-5xl font-bold text-black">NGN {payment.amountPaid.toLocaleString()}</p>
          </div>

          <div className="text-sm text-gray-600 space-y-2 mt-8">
            <h4 className="font-bold text-base text-black">Notes / Reference:</h4>
            <p>{payment.notes || 'No notes provided.'}</p>
          </div>

          <Separator className="my-8 bg-gray-300" />

           <div className="text-center mt-6">
                <p className="text-2xl font-semibold text-green-600">Thank You!</p>
                <p className="text-gray-500">Your payment has been successfully recorded.</p>
           </div>
        </main>

        <footer className="mt-12 text-center text-xs text-gray-500 border-t pt-4">
            <p>Phone: {schoolInfo?.phone} | Email: {schoolInfo?.email}</p>
        </footer>
      </div>
  );
}
