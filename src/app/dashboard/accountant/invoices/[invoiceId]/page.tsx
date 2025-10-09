
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Invoice } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InvoiceTemplate } from '@/components/dashboard/invoices/invoice-template';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function IndividualInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { invoiceId } = params;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const fetchInvoice = useCallback(async () => {
    if (typeof invoiceId !== 'string') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const invoiceDocRef = doc(db, 'invoices', invoiceId);
      const docSnap = await getDoc(invoiceDocRef);

      if (docSnap.exists()) {
        setInvoice({ id: docSnap.id, ...docSnap.data() } as Invoice);
      } else {
        setError('Invoice not found.');
        notFound();
      }
    } catch (e: any) {
      console.error('Error fetching invoice:', e);
      setError(e.message || 'An error occurred while fetching the invoice.');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleDownload = async () => {
    if (!invoiceRef.current || !invoice) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(invoiceRef.current, {
            scale: 2,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;

        let finalImgWidth = pdfWidth - 20; // Margin
        let finalImgHeight = finalImgWidth / ratio;
        
        if (finalImgHeight > pdfHeight - 20) {
            finalImgHeight = pdfHeight - 20;
            finalImgWidth = finalImgHeight * ratio;
        }

        const x = (pdfWidth - finalImgWidth) / 2;
        const y = 10; // Top margin

        pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
        pdf.save(`Invoice-${invoice.invoiceId}.pdf`);

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

  if (!invoice) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
          <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
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

      <div ref={invoiceRef}>
        <InvoiceTemplate invoice={invoice} />
      </div>
    </div>
  );
}
