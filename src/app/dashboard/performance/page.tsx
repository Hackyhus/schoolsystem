import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function PerformancePage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">Student Performance</h1>
        <p className="text-muted-foreground">
          View attendance records and grades.
        </p>
      </div>

       <Card className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary"/>
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>The student performance module is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Parents will be able to view detailed reports on their child's academic progress.
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
