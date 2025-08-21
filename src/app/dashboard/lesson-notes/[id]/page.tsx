import { lessonNotes } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Send, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import { LessonNoteSummarizer } from '@/components/lesson-note-summarizer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function LessonNoteDetailPage({ params }: { params: { id: string } }) {
  const note = lessonNotes.find((n) => n.id === params.id);

  if (!note) {
    notFound();
  }
  
  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">{note.title}</h1>
        <p className="text-muted-foreground">
          Submitted by {note.teacherName} on {note.submissionDate}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Lesson Note Content</CardTitle>
                    <CardDescription>Subject: {note.subject}</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-stone dark:prose-invert max-w-none">
                    <p>{note.content}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Review & Approval</CardTitle>
                    <CardDescription>Provide feedback for the teacher.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea placeholder="Type your review here..." />
                  <div className="flex justify-end gap-2">
                    <Button variant="destructive"><ThumbsDown className="mr-2 h-4 w-4"/>Reject</Button>
                    <Button><ThumbsUp className="mr-2 h-4 w-4"/>Approve</Button>
                  </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Status & History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-medium">Current Status</span>
                       <Badge variant={statusVariant(note.status)}>{note.status}</Badge>
                    </div>
                    <Separator />
                    <ul className="space-y-4">
                        <li className="flex gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Send className="h-4 w-4"/>
                            </div>
                            <div>
                                <p className="font-medium">Submitted by Teacher</p>
                                <p className="text-sm text-muted-foreground">{note.teacherName} on {note.submissionDate}</p>
                            </div>
                        </li>
                         {note.hod_review && (
                             <li className="flex gap-4">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${note.status.includes('Rejected') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    <User className="h-4 w-4"/>
                                </div>
                                <div>
                                    <p className="font-medium">HOD Review</p>
                                    <p className="text-sm text-muted-foreground">{note.hod_review}</p>
                                </div>
                            </li>
                         )}
                         {note.admin_review && (
                             <li className="flex gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <Check className="h-4 w-4"/>
                                </div>
                                <div>
                                    <p className="font-medium">Final Approval</p>
                                    <p className="text-sm text-muted-foreground">{note.admin_review}</p>
                                </div>
                            </li>
                         )}
                    </ul>
                </CardContent>
            </Card>
            <LessonNoteSummarizer lessonNotes={note.content} />
        </div>
      </div>
    </div>
  );
}
