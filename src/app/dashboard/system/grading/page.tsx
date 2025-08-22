'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GradingSystemPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Grading System</h1>
                <p className="text-muted-foreground">
                    Configure grade scales, GPA calculations, and report card comments.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to manage the grading system here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Interface for setting grade boundaries (e.g., A = 90-100) will be here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
