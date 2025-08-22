
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ExamRegistrationPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Exam Registration</h1>
                <p className="text-muted-foreground">
                    Manage student registrations for upcoming examinations.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Student Exam Entry</CardTitle>
                    <CardDescription>
                       This feature is coming soon. You will be able to manage student entries and special arrangements.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Register Student
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
