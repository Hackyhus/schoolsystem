
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
import { aiEngine } from '@/ai';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function LessonNoteSummarizer({ lessonNotes, subject, className }: { lessonNotes: string, subject: string, className: string }) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span>AI Summary (Coming Soon)</span>
        </CardTitle>
        <CardDescription>
          This feature is in development and will be available shortly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center rounded-md border border-dashed p-8 text-center text-muted-foreground">
          <p>A summary of this lesson note will be generated here.</p>
        </div>
        <Button disabled className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Sparkles className="mr-2 h-4 w-4" /> Generate Summary
        </Button>
      </CardContent>
    </Card>
  );
}

    