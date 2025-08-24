
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReconciliationPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Bank Reconciliation</h1>
                <p className="text-muted-foreground">
                    Reconcile bank statements with internal records.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to upload statements and match transactions here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
