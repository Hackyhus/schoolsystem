
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancialReportsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Financial Reports</h1>
                <p className="text-muted-foreground">
                    Generate and view all financial reports.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to view detailed financial reports here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
