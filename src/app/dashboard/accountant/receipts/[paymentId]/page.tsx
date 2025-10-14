
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Payment } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, ArrowLeft, Printer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReceiptTemplate } from '@/components/dashboard/receipts/receipt-template';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function IndividualReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { paymentId } = params;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayment = useCallback(async () => {
    if (typeof paymentId !== 'string') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const paymentDocRef = doc(db, 'payments', paymentId);
      const docSnap = await getDoc(paymentDocRef);

      if (docSnap.exists()) {
        setPayment({ id: docSnap.id, ...docSnap.data() } as Payment);
      } else {
        setError('Payment record not found.');
        notFound();
      }
    } catch (e: any) {
      console.error('Error fetching payment:', e);
      setError(e.message || 'An error occurred while fetching the receipt data.');
    } finally {
      setIsLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const contentElement = document.getElementById('pdf-content');

    if (!contentElement || !payment) return;
    setIsDownloading(true);

    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'a4',
        });

        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 0.5;
        const contentWidth = pageWidth - (margin * 2);
        
        const canvas = await html2canvas(contentElement, {
            scale: 2,
            useCORS: true,
            width: contentElement.offsetWidth,
        });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);

        pdf.save(`Receipt-${payment.invoiceId}.pdf`);

    } catch (error) {
        console.error("Failed to generate PDF", error);
        setError("Could not generate the PDF for download.");
    } finally {
        setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-64" />
        <div className="space-y-8">
          <Skeleton className="h-[800px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
          <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
            <Button onClick={handleDownload} size="lg" disabled={isDownloading}>
                {isDownloading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </>
                )}
            </Button>
          </div>
      </div>
      
      <ReceiptTemplate payment={payment} />
    </div>
  );
}
