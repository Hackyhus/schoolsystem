
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Landmark, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountantPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Accountant Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage all financial operations for the school.
                </p>
            </div>
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Fees Collected (Month)
                    </CardTitle>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-24" />
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Outstanding Receivables
                    </CardTitle>
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-8 w-24" />
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Pending Invoices
                    </CardTitle>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Next Payroll
                    </CardTitle>
                    <Landmark className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-24" />
                </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This dashboard is under construction. Full data visualizations and financial management tools will be available here shortly.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
