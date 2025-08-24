
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvoicesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Invoices</h1>
                <p className="text-muted-foreground">
                    Generate, send, and track student invoices.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to manage student invoices here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
