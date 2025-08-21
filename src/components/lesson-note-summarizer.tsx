'use client';
import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { summarizeLessonNotes } from '@/ai/flows/lesson-note-summarizer';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function LessonNoteSummarizer({ lessonNotes }: { lessonNotes: string }) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleSummarize = () => {
    setError('');
    setSummary('');
    startTransition(async () => {
      try {
        const result = await summarizeLessonNotes({ lessonNotes });
        if (result.summary) {
            setSummary(result.summary);
        } else {
            setError("The AI couldn't generate a summary. Please try again.");
        }
      } catch (e) {
        console.error(e);
        setError('An unexpected error occurred while generating the summary.');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span>AI Summary</span>
        </CardTitle>
        <CardDescription>
          Get a quick overview of the key points in this lesson note.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending && (
          <div className="flex items-center justify-center rounded-md border border-dashed p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {summary && (
          <div className="rounded-md border bg-muted/50 p-4 text-sm">
            {summary}
          </div>
        )}
        <Button onClick={handleSummarize} disabled={isPending} className="w-full">
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Generate Summary</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
