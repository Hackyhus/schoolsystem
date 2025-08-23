
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export function ReviewForm({ onSubmit }: { onSubmit: (action: 'Revision', comment: string) => void; }) {
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!comment) {
      toast({
        variant: 'destructive',
        title: 'Comment Required',
        description: 'Please provide a comment before requesting a revision.',
      });
      return;
    }
    
    onSubmit('Revision', comment);
    setComment('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="revision-comment" className="text-base font-semibold">Request Revision</Label>
        <p className="text-sm text-muted-foreground">If corrections are needed, provide your feedback below and send it back to the teacher.</p>
      </div>
      <Textarea
        id="revision-comment"
        placeholder="Type your feedback here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleSubmit}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Send Feedback & Request Revision
        </Button>
      </div>
    </div>
  );
}
