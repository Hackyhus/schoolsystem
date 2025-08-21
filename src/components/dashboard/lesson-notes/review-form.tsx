
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsDown, ThumbsUp, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ReviewForm({ onSubmit }: { onSubmit: (action: 'Approve' | 'Reject' | 'Revision', comment: string) => void; }) {
  const [review, setReview] = useState('');
  const { toast } = useToast();

  const handleSubmit = (action: 'Approve' | 'Reject' | 'Revision') => {
    if (!review) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a review comment before submitting.',
      });
      return;
    }
    
    onSubmit(action, review);
    setReview('');
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Type your review here..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => handleSubmit('Revision')}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Request Revision
        </Button>
        <Button variant="destructive" onClick={() => handleSubmit('Reject')}>
          <ThumbsDown className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button onClick={() => handleSubmit('Approve')}>
          <ThumbsUp className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>
    </div>
  );
}

    