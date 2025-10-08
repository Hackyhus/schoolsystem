
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReportCard } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReportCardTemplate } from '@/components/dashboard/results/report-card-template';
import { Skeleton } from '@/components/ui/skeleton';

export default function ViewClassResultsPage() {
  const params = useParams();
  const { classId } = params;
  const className = decodeURIComponent(classId as string);

  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reportsQuery = query(
        collection(db, 'reportCards'),
        where('class', '==', className),
        orderBy('classRank', 'asc')
      );

      const querySnapshot = await getDocs(reportsQuery);
      if (querySnapshot.empty) {
        setError(
          `No report cards found for ${className}. Please generate the results first.`
        );
      } else {
        const reports = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as ReportCard)
        );
        setReportCards(reports);
      }
    } catch (e: any) {
      console.error('Error fetching report cards:', e);
      setError(e.message || 'An error occurred while fetching reports.');
    } finally {
      setIsLoading(false);
    }
  }, [className]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePrint = () => {
    window.print();
  };
  
  if(isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-8 w-64" />
            <div className="space-y-8">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-[500px] w-full" />
                ))}
            </div>
        </div>
    )
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
           <h1 className="font-headline text-3xl font-bold">
            Report Cards for {className}
          </h1>
          <p className="text-muted-foreground">
            Displaying {reportCards.length} generated report cards for the {reportCards[0]?.term}, {reportCards[0]?.session} session.
          </p>
        </div>
        <Button onClick={handlePrint} size="lg">
          <Printer className="mr-2 h-4 w-4" />
          Print All Reports
        </Button>
      </div>

      <div className="space-y-12">
        {reportCards.map((report) => (
          <ReportCardTemplate key={report.id} reportCard={report} />
        ))}
      </div>
    </div>
  );
}
