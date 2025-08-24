
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Payments</h1>
                <p className="text-muted-foreground">
                    Record and track all fee payments.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to record and view payments here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
