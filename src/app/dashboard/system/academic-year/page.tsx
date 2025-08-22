'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcademicYearPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Academic Year</h1>
                <p className="text-muted-foreground">
                    Set term dates, school holidays, and manage academic sessions.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to manage academic sessions here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Interface to set start and end dates for terms and the current session will be here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
