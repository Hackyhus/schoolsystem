'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SchoolInfoPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">School Information</h1>
                <p className="text-muted-foreground">
                    Manage the school's general details.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to edit school details here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Form to edit school name, address, logo, etc. will be here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
