
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PayrollPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Payroll</h1>
                <p className="text-muted-foreground">
                    Manage staff salaries and generate payslips.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to run payroll and manage salary structures here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
