
'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
import { Check, Send, ThumbsDown, ThumbsUp, User, File as FileIcon, AlertTriangle, Upload } from 'lucide-react';
import { ReviewForm } from '@/components/dashboard/lesson-notes/review-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/context/role-context';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddLessonNoteForm } from '@/components/dashboard/lesson-notes/add-lesson-note-form';


async function createNotification(teacherId: string, noteId: string, noteTitle: string, action: 'Approved' | 'Rejected' | 'Needs Revision') {
  try {
    let type: 'APPROVAL' | 'REJECTION' | 'INFO' = 'INFO';
    if (action === 'Approved') type = 'APPROVAL';
    if (action === 'Rejected' || action === 'Needs Revision') type = 'REJECTION';
    
    await addDoc(collection(db, "notifications"), {
      toUserId: teacherId,
      type: type,
      title: `Lesson Note Update: ${action}`,
      body: `Your lesson note "${noteTitle}" has been marked as ${action.toLowerCase()}.`,
      ref: {
        collection: 'lessonNotes',
        id: noteId,
      },
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

export default function LessonNoteDetailPage() {
  const params = useParams();
  const { id } = params;
  const [note, setNote] = useState<MockLessonNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { role, user } = useRole();
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);

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

  const handleReview = async (action: 'Approve' | 'Reject' | 'Revision', comment: string) => {
    if (typeof id !== 'string' || !note || !user) return;

    let actionPastTense: 'Approved' | 'Rejected' | 'Needs Revision' = 'Approved';
    if (action === 'Reject') actionPastTense = 'Rejected';
    if (action === 'Revision') actionPastTense = 'Needs Revision';

    let newStatus = note.status;
    let reviewData = {};
    const reviewerName = user.displayName || 'Reviewer';
    const reviewComment = `${actionPastTense} by ${reviewerName}: ${comment}`;

    if (role === 'HeadOfDepartment') {
        if(action === 'Approve') newStatus = 'Pending Admin Approval';
        else if(action === 'Reject') newStatus = 'Rejected by HOD';
        else if(action === 'Revision') newStatus = 'Needs Revision';
      reviewData = { status: newStatus, hod_review: reviewComment };
    } else if (role === 'Admin' || role === 'Principal' || role === 'Director') {
        if(action === 'Approve') newStatus = 'Approved';
        else if(action === 'Reject') newStatus = 'Rejected by Admin';
        else if(action === 'Revision') newStatus = 'Needs Revision';
       reviewData = { status: newStatus, admin_review: reviewComment };
    }

    try {
        const docRef = doc(db, 'lessonNotes', id);
        await updateDoc(docRef, reviewData);
        
        await createNotification(note.teacherId, note.id, note.title, actionPastTense);

        toast({
            title: `Lesson Note ${actionPastTense}`,
            description: "The status has been updated and the teacher has been notified.",
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

  const handleResubmission = () => {
    fetchNote();
    setIsResubmitModalOpen(false);
  };

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    if (status.includes('Revision')) return 'destructive';
    return 'outline';
  };
  
  const getReviewerFeedback = () => {
    if (note?.status.includes('Needs Revision')) {
      return note.admin_review || note.hod_review;
    }
    return null;
  }

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
  
  const reviewerFeedback = getReviewerFeedback();
  const canTeacherResubmit = role === 'Teacher' && note.status === 'Needs Revision';
  const canReview = role === 'Admin' || role === 'HeadOfDepartment' || role === 'Principal' || role === 'Director';

  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">{note.title}</h1>
        <p className="text-muted-foreground">
          Submitted by {note.teacherName} on {note.submissionDate}
        </p>
      </div>

       {reviewerFeedback && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Revision Requested</AlertTitle>
          <AlertDescription>
            {reviewerFeedback.replace(/Needs Revision by.*?:/, 'Feedback:')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Lesson Note Document</CardTitle>
                    <CardDescription>Subject: {note.subject}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {note.fileUrl ? (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                      <FileIcon className="h-10 w-10 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {note.title}.{note.fileUrl.split('.').pop()?.split('?')[0]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click to download the lesson note file.
                        </p>
                      </div>
                      <Button asChild>
                        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No file was uploaded for this lesson note.</p>
                  )}
                   {canTeacherResubmit && (
                      <Dialog open={isResubmitModalOpen} onOpenChange={setIsResubmitModalOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Re-upload Corrected File
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resubmit Corrected Document</DialogTitle>
                            <DialogDescription>
                              Upload the new version of your file. This will replace the previous one and restart the review process.
                            </DialogDescription>
                          </DialogHeader>
                          <AddLessonNoteForm
                            onNoteAdded={handleResubmission}
                            existingNoteData={note}
                            isResubmission={true}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                </CardContent>
            </Card>
            {canReview && (
              <Card>
                  <CardHeader>
                      <CardTitle>Review & Approval</CardTitle>
                      <CardDescription>Provide feedback for the teacher.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ReviewForm onSubmit={handleReview} />
                  </CardContent>
              </Card>
            )}
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
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${note.status.includes('Rejected') || note.status.includes('Revision') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
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
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${note.status.includes('Rejected') || note.status.includes('Revision') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
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
        </div>
      </div>
    </div>
  );
}
