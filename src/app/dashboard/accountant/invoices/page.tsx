
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

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
                    <CardTitle>Invoice Management</CardTitle>
                    <CardDescription>
                        This module will allow for the bulk generation of invoices for all students based on the defined fee structures. Accountants can view the status of all invoices (paid, pending, overdue), send reminders to parents, and track the overall revenue collection for the term. A secure payment gateway will be integrated to facilitate online payments.
                        <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled>
                        <FileText className="mr-2 h-4 w-4" /> Generate Invoices
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
