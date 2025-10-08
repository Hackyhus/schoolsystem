
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAcademicData } from "@/hooks/use-academic-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GenerateResultsPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const { classes, isLoading: isAcademicDataLoading } = useAcademicData();
    const [selectedClass, setSelectedClass] = useState('');

    const handleGenerate = () => {
        setIsGenerating(true);
        // In a real application, this would trigger a server-side process
        // that fetches all approved scores for the selected class, calculates
        // positions, averages, grades, and generates report card documents.
        setTimeout(() => {
            setIsGenerating(false);
        }, 3000);
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Generate Student Results</h1>
                <p className="text-muted-foreground">
                    Process approved scores to generate final report cards for a class.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Result Generation Engine</CardTitle>
                    <CardDescription>
                        Select a class to begin the result generation process. This action will compile all approved scores for the current term, calculate student positions, averages, and assign grades.
                        <br />
                        <strong className="text-destructive">This is an irreversible process for the term. Ensure all scores have been reviewed and approved.</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="max-w-sm space-y-2">
                         <Select onValueChange={setSelectedClass} value={selectedClass} disabled={isAcademicDataLoading || isGenerating}>
                            <SelectTrigger>
                            <SelectValue placeholder={isAcademicDataLoading ? "Loading Classes..." : "Select Class to Generate Results"} />
                            </SelectTrigger>
                            <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Only classes with fully approved scores for all subjects will be processed.
                        </p>
                    </div>

                    <Button onClick={handleGenerate} disabled={isGenerating || !selectedClass} size="lg">
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating for {selectedClass}...
                            </>
                        ) : (
                            `Generate Results for ${selectedClass}`
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
