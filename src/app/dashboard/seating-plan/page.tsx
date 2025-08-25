
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Grid } from "lucide-react";

export default function SeatingPlanPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Seating Plan Generator</h1>
                <p className="text-muted-foreground">
                    Create and export seating arrangements for exams.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Generate New Plan</CardTitle>
                    <CardDescription>
                       This tool will assist the Exam Officer in creating and visualizing seating arrangements for examination halls. The system will be able to automatically generate randomized, spaced-out seating plans based on the list of registered students to uphold exam integrity. The final plan can be exported as a PDF for invigilators.
                       <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                     <Button disabled>
                        <Grid className="mr-2 h-4 w-4" />
                        Generate Plan
                    </Button>
                    <Button variant="outline" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
