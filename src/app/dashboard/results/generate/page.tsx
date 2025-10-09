
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAcademicData } from "@/hooks/use-academic-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateResultsForClass } from "@/actions/result-actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

const SESSIONS = ["2023/2024", "2024/2025", "2025/2026"];
const TERMS = ["First Term", "Second Term", "Third Term"];

export default function GenerateResultsPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const { classes, isLoading: isAcademicDataLoading } = useAcademicData();
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSession, setSelectedSession] = useState(SESSIONS[0]);
    const [selectedTerm, setSelectedTerm] = useState(TERMS[0]);
    const { toast } = useToast();
    const router = useRouter();

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateResultsForClass(selectedClass, selectedSession, selectedTerm);

            if (result.error) {
                throw new Error(result.error);
            }

            toast({
                title: 'Results Generated Successfully!',
                description: `Report cards for ${result.generatedCount} students in ${selectedClass} have been created.`,
            });
            
            router.push(`/dashboard/results/view/${selectedClass}`);

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Result Generation Failed',
                description: error.message || 'An unexpected error occurred.',
                duration: 9000,
            });
        } finally {
            setIsGenerating(false);
        }
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
                        Select a class, session, and term to begin the result generation process. This action will compile all approved scores, calculate student positions, averages, and assign grades.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Critical Action</AlertTitle>
                        <AlertDescription>
                            This is an irreversible process for the selected term. Ensure all scores have been entered and approved before proceeding.
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <Select onValueChange={setSelectedClass} value={selectedClass} disabled={isAcademicDataLoading || isGenerating}>
                            <SelectTrigger>
                            <SelectValue placeholder={isAcademicDataLoading ? "Loading Classes..." : "Select Class"} />
                            </SelectTrigger>
                            <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select onValueChange={setSelectedSession} value={selectedSession} disabled={isGenerating}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                            <SelectContent>
                                {SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select onValueChange={setSelectedTerm} value={selectedTerm} disabled={isGenerating}>
                             <SelectTrigger>
                                <SelectValue placeholder="Select Term" />
                            </SelectTrigger>
                            <SelectContent>
                                {TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleGenerate} disabled={isGenerating || !selectedClass} size="lg" className="w-full md:w-auto">
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating for {selectedClass}...
                            </>
                        ) : (
                            `Generate Results for ${selectedClass || '...'}`
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
