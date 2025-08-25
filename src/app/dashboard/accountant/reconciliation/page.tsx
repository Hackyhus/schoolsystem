
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

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
                    <CardTitle>Automated Reconciliation</CardTitle>
                    <CardDescription>
                        To ensure financial accuracy, this feature will allow the Accountant to upload monthly bank statements. The system will then automatically attempt to match transactions from the statement with payments recorded in the portal, flagging any discrepancies for manual review. This simplifies the auditing process and ensures all funds are accounted for.
                        <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled>
                        <Upload className="mr-2 h-4 w-4" /> Upload Statement
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
