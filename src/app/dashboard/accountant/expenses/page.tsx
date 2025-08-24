
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpensesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Expenses</h1>
                <p className="text-muted-foreground">
                    Manage school expenditures and budgets.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to manage budgets and log expenses here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
