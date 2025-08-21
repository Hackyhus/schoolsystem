
'use client';
import {
  Archive,
  ArchiveX,
  File,
  Inbox,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { messages } from '@/lib/mock-data';
import { useRole } from '@/context/role-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function MessagingPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(messages.length > 0 ? messages[0].id : null);
  const { role } = useRole();

  const message = messages.find((m) => m.id === selectedMessage);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Messaging</h1>
        <p className="text-muted-foreground">
          Communicate with teachers, parents, and administrators.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[65vh] items-stretch"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout=${JSON.stringify(
              sizes
            )}`;
          }}
        >
          <ResizablePanel
            defaultSize={25}
            minSize={15}
            maxSize={30}
            collapsible
            collapsedSize={4}
            onCollapse={() => setIsCollapsed(true)}
            onExpand={() => setIsCollapsed(false)}
            className={cn(
              isCollapsed &&
                'min-w-[50px] transition-all duration-300 ease-in-out'
            )}
          >
            <div
              className={cn(
                'flex h-[56px] items-center p-2',
                isCollapsed ? 'justify-center' : 'px-4'
              )}
            >
              <h2
                className={cn(
                  'font-headline text-xl font-bold',
                  isCollapsed && 'hidden'
                )}
              >
                Inbox
              </h2>
            </div>
            <Separator />
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search" className="pl-8" />
              </div>
            </div>
            {messages.length > 0 ? (
              <div className="flex flex-col gap-1 p-2">
                {messages.map((item) => (
                  <button
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                      selectedMessage === item.id && 'bg-muted font-semibold',
                      isCollapsed && 'justify-center'
                    )}
                    onClick={() => setSelectedMessage(item.id)}
                  >
                    <Inbox className="h-4 w-4" />
                    <span className={cn(isCollapsed && 'hidden')}>
                      {item.from}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>No messages</p>
              </div>
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            {message ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center p-4">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Archive className="h-4 w-4" />
                            <span className="sr-only">Archive</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archive</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Move to trash</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to trash</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start p-4">
                    <div className="flex items-start gap-4 text-sm">
                      <Avatar>
                        <AvatarImage alt={message.from} />
                        <AvatarFallback>
                          {message.from
                            .split(' ')
                            .map((chunk) => chunk[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <div className="font-semibold">{message.from}</div>
                        <div className="line-clamp-1 text-xs">
                          To: {message.to}
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {new Date(message.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
                    {message.content}
                  </div>
                  <Separator />
                   <div className="p-4">
                    <form>
                      <div className="grid gap-4">
                        <Input
                          id="message"
                          placeholder={`Reply to ${message.from}...`}
                        />
                        <div className="flex items-center">
                           <Button size="sm" className="ml-auto">
                            Send
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-4">
                <div className="text-center text-muted-foreground">
                  <Inbox className="mx-auto h-12 w-12" />
                  <p className="mt-2">Select a message to view</p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
