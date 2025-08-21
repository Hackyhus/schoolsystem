import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Analyze school-wide data and generate reports.
        </p>
      </div>

       <Card className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BarChart2 className="h-8 w-8 text-primary"/>
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>The reports and analytics dashboard is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Detailed analytics on lesson submissions, attendance, and more will be available here.
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
