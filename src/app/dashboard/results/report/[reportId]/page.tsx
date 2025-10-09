
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
  const reportRef = useRef<HTMLDivElement>(null);

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
    if (!reportRef.current || !reportCard) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(reportRef.current, {
            scale: 2, // Increase scale for better resolution
        });
        const imgData = canvas.toDataURL('image/png');

        // A4 dimensions in mm: 210 x 297
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        // Calculate dimensions to fit A4 page with margins
        const margin = 10; // 10mm margin on each side
        const availableWidth = pdfWidth - (margin * 2);
        const availableHeight = pdfHeight - (margin * 2);

        // Calculate width and height based on fitting the page height
        let imgFinalHeight = availableHeight;
        let imgFinalWidth = imgFinalHeight * canvasAspectRatio;

        // If calculated width is too wide, scale down to fit width instead
        if (imgFinalWidth > availableWidth) {
            imgFinalWidth = availableWidth;
            imgFinalHeight = imgFinalWidth / canvasAspectRatio;
        }
        
        const x = (pdfWidth - imgFinalWidth) / 2; // Center horizontally
        const y = margin; // Start from top margin

        pdf.addImage(imgData, 'PNG', x, y, imgFinalWidth, imgFinalHeight);
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

        <div ref={reportRef}>
          <ReportCardTemplate reportCard={reportCard} />
        </div>

      </div>
    </>
  );
}
