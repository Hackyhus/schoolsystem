'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockLessonNote } from '@/lib/schema';
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
import { ReviewForm } from '@/components/dashboard/lesson-notes/review-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/context/role-context';

export default function LessonNoteDetailPage() {
  const params = useParams();
  const { id } = params;
  const [note, setNote] = useState<MockLessonNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { role } = useRole();

  const fetchNote = useCallback(async () => {
    if (typeof id !== 'string') return;
    setIsLoading(true);
    try {
      const docRef = doc(db, 'lessonNotes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setNote({ id: docSnap.id, ...docSnap.data() } as MockLessonNote);
      } else {
        notFound();
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch the lesson note."
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleReview = async (action: 'Approve' | 'Reject', comment: string) => {
    if (typeof id !== 'string' || !note) return;

    let newStatus = note.status;
    let reviewData = {};

    if (role === 'HeadOfDepartment') {
      newStatus = action === 'Approve' ? 'Pending Admin Approval' : 'Rejected by HOD';
      reviewData = { status: newStatus, hod_review: `${action}d: ${comment}` };
    } else if (role === 'Admin') {
      newStatus = action === 'Approve' ? 'Approved' : 'Rejected by Admin';
       reviewData = { status: newStatus, admin_review: `${action}d: ${comment}` };
    }

    try {
        const docRef = doc(db, 'lessonNotes', id);
        await updateDoc(docRef, reviewData);
        toast({
            title: `Lesson Note ${action}d`,
            description: "The status has been updated.",
        });
        fetchNote(); // Re-fetch the note to show updated status
    } catch (error) {
         console.error("Error updating document:", error);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update the lesson note.",
        });
    }

  }

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  if (isLoading) {
    return (
       <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="mt-2 h-5 w-1/3" />
        </div>
         <div className="grid gap-8 lg:grid-cols-3">
           <div className="lg:col-span-2 space-y-8">
             <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
             <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
           </div>
           <div className="lg:col-span-1 space-y-8">
              <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
           </div>
         </div>
       </div>
    );
  }

  if (!note) {
    return notFound();
  }
  
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
                  <ReviewForm onSubmit={handleReview} />
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
