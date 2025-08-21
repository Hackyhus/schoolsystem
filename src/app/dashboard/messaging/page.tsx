import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function MessagingPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">Messaging</h1>
        <p className="text-muted-foreground">
          Communicate with teachers, parents, and administrators.
        </p>
      </div>

       <Card className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary"/>
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>The in-app messaging feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                We are working hard to bring you a seamless communication experience.
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
