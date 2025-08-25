
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

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
                    <CardTitle>Run Monthly Payroll</CardTitle>
                    <CardDescription>
                        The payroll module will automate the entire salary process. Accountants can define salary structures for different staff roles, including earnings and deductions. At the end of each month, the system will calculate the net pay for all staff, generate digital payslips, and provide a summary for bank transfers.
                        <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button disabled>
                        <Briefcase className="mr-2 h-4 w-4" /> Run New Payroll
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
