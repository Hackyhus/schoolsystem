
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft, Printer, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { dbService } from '@/lib/firebase';
import type { Announcement, SchoolInfo } from '@/lib/schema';
import { AnnouncementTemplate } from '@/components/dashboard/announcements/announcement-template';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function IndividualAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (typeof id !== 'string') return;
    
    setIsLoading(true);
    setError(null);
    try {
       const [announcementData, schoolInfoData] = await Promise.all([
            dbService.getDoc<Announcement>('announcements', id),
            dbService.getDoc<SchoolInfo>('system', 'schoolInfo')
       ]);

      if (announcementData) {
        setAnnouncement(announcementData);
      } else {
        setError('Announcement not found.');
        notFound();
      }
      
      if(schoolInfoData) {
        setSchoolInfo(schoolInfoData);
      } else {
        // This is not a fatal error, the template can handle it
        console.warn("School information is not configured in System > School Info.");
      }

    } catch (e: any) {
      console.error('Error fetching data:', e);
      setError(e.message || 'An error occurred while fetching the announcement.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const contentElement = document.getElementById('pdf-content');
    if (!contentElement || !announcement) return;
    setIsDownloading(true);
    
    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'a4',
        });

        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        
        const canvas = await html2canvas(contentElement, {
            scale: 2,
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = -heightLeft;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`Announcement-${announcement.title.replace(/ /g, '-')}.pdf`);

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
        <div className="space-y-8 max-w-4xl mx-auto">
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

  if (!announcement) {
    return null;
  }

  return (
    <div className="space-y-6">
       <div className="print-hidden flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Announcements
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
      
      <div id="printable-area">
        <AnnouncementTemplate announcement={announcement} schoolInfo={schoolInfo} />
      </div>
    </div>
  );
}
