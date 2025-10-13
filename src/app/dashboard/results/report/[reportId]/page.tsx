
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReportCard } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReportCardTemplate } from '@/components/dashboard/results/report-card-template';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function IndividualReportPage() {
  const params = useParams();
  const router = useRouter();
  const { reportId } = params;

  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (typeof reportId !== 'string') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const reportDocRef = doc(db, 'reportCards', reportId);
      const docSnap = await getDoc(reportDocRef);

      if (docSnap.exists()) {
        setReportCard({ id: docSnap.id, ...docSnap.data() } as ReportCard);
      } else {
        setError('Report card not found.');
        notFound();
      }
    } catch (e: any) {
      console.error('Error fetching report card:', e);
      setError(e.message || 'An error occurred while fetching the report.');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownload = async () => {
    const contentElement = document.getElementById('pdf-content');

    if (!contentElement || !reportCard) return;
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
            scale: 2, // Higher scale for better quality
            useCORS: true,
            width: contentElement.offsetWidth,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = margin;

        // Add first page
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);

        // Add new pages if content overflows
        while (heightLeft > 0) {
            position = -heightLeft + margin;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
            heightLeft -= (pageHeight - margin * 2);
        }

        pdf.save(`Report-Card-${reportCard.studentName.replace(/ /g, '-')}.pdf`);

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

  if (!reportCard) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
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

        <ReportCardTemplate reportCard={reportCard} />

      </div>
    </>
  );
}
