
'use client';
import {
  Archive,
  Inbox,
  Search,
  Users,
  Send
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function MessagingPage() {

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Internal Messaging</h1>
        <p className="text-muted-foreground">
          Communicate with teachers, parents, and administrators.
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Secure Communication Hub</CardTitle>
                <CardDescription>
                    This feature will provide a secure, internal messaging system for seamless communication between all portal users. Staff will be able to message parents, HODs can communicate with their department members, and administrators can send out targeted announcements.
                    <br /><br />
                    <strong className="text-primary">This feature is currently in development. The full functionality for sending and receiving messages will be available once the project is approved.</strong>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
                    <ResizablePanelGroup
                    direction="horizontal"
                    className="min-h-[65vh] items-stretch"
                    >
                    <ResizablePanel
                        defaultSize={25}
                        minSize={15}
                        maxSize={30}
                    >
                        <div className="flex h-[56px] items-center p-4">
                            <h2 className='font-headline text-xl font-bold'>Inbox</h2>
                        </div>
                        <Separator />
                        <div className="p-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search" className="pl-8" />
                            </div>
                        </div>
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            <Inbox className="mx-auto h-8 w-8 opacity-50" />
                            <p>Your inbox is empty.</p>
                        </div>

                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={75}>
                        <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
                            <Send className="mx-auto h-12 w-12" />
                            <p className="mt-4 font-semibold">Messaging Is Coming Soon</p>
                            <p className="mt-1 text-sm">You will be able to send and receive messages here.</p>
                        </div>
                    </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
