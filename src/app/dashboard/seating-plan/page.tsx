
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
                       This feature is coming soon. You will be able to generate and download seating plans.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                     <Button>
                        <Grid className="mr-2 h-4 w-4" />
                        Generate Plan
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
