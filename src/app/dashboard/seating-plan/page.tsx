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
                    <CardTitle>Generate New Seating Plan</CardTitle>
                    <CardDescription>
                       This tool will assist the Exam Officer in creating and visualizing seating arrangements for examination halls. The system will be able to automatically generate randomized, spaced-out seating plans based on the list of registered students to uphold exam integrity. The final plan can be exported as a PDF for invigilators.
                       <br /><br />
                        <strong className="text-primary">This feature is currently in development and will be available once the project is approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                         <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                             <Grid className="h-8 w-8 text-primary" />
                         </div>
                        <h3 className="text-lg font-semibold">Seating Plan Generator is Coming Soon</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                           An automated tool for creating exam seating plans will be available here.
                        </p>
                        <Button disabled className="mt-4">
                            Generate Plan
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
