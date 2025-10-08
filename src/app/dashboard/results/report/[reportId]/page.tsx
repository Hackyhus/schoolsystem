
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReportCard } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReportCardTemplate } from '@/components/dashboard/results/report-card-template';
import { Skeleton } from '@/components/ui/skeleton';

export default function IndividualReportPage() {
  const params = useParams();
  const router = useRouter();
  const { reportId } = params;

  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (typeof reportId !== 'string') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const reportRef = doc(db, 'reportCards', reportId);
      const docSnap = await getDoc(reportRef);

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

  const handlePrint = () => {
    window.print();
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
    <div className="space-y-6">
       <style jsx global>{`
        @media print {
          body {
            background-color: #fff;
          }
          .main-content > *:not(.printable-area) {
            display: none;
          }
           main {
             padding: 0 !important;
           }
          .printable-area {
            display: block;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
      <div className="main-content">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Button onClick={handlePrint} size="lg">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
            </Button>
        </div>

        <div className="printable-area space-y-12">
            <ReportCardTemplate reportCard={reportCard} />
        </div>
      </div>
    </div>
  );
}

