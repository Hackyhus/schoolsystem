
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ExpensesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Expenses & Budgeting</h1>
                <p className="text-muted-foreground">
                    Log school expenditures and track them against departmental budgets.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Budget vs. Actual</CardTitle>
                    <CardDescription>
                        This section will provide tools to set termly or annual budgets for each department and log all school-related expenses. Accountants will be able to monitor spending, generate variance reports, and ensure financial discipline across the institution.
                        <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
