
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookUser, BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SltPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">SLT Dashboard</h1>
                <p className="text-muted-foreground">
                    High-level academic and operational oversight.
                </p>
            </div>

             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Total Students
                    </CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Total Staff
                    </CardTitle>
                    <BookUser className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Attendance Today
                    </CardTitle>
                    <BarChart2 className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Fees Collected (Term)
                    </CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16" />
                </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This dashboard is under construction. Full data visualizations and reports will be available here shortly.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
