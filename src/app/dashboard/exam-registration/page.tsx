
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
                       This module enables the Exam Officer to formally register students for internal and external examinations. It will support managing student entries, assigning exam numbers, and noting any special arrangements (e.g., extra time). This ensures a formal and organized process for all major assessments.
                       <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Register Student
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
