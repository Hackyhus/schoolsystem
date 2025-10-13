'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function AcademicYearPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Academic Year &amp; Terms</h1>
                <p className="text-muted-foreground">
                    Set term dates, school holidays, and manage academic sessions.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Session Management</CardTitle>
                    <CardDescription>
                        This crucial configuration area will allow Administrators to define the academic calendar for the entire school. Key functions include setting the current academic session (e.g., 2024/2025), and defining the start and end dates for each term. This information will drive scheduling, fee generation, and reporting across the portal.
                        <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                         <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                             <Calendar className="h-8 w-8 text-primary" />
                         </div>
                        <h3 className="text-lg font-semibold">Academic Calendar is Coming Soon</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                           An interface to manage sessions and term dates will be available here.
                        </p>
                        <Button disabled className="mt-4">
                            Configure Session
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
