
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Sparkles, User, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useRole } from '@/context/role-context';

type Message = {
    role: 'user' | 'bot';
    content: string;
};

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
        role: 'bot',
        content: "Hello! I'm your AI assistant for the InsightConnect Portal. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const { user } = useRole();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // TODO: Wire up AI logic here
    const botMessage: Message = { role: 'bot', content: "AI response is not connected yet." };
    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 flex flex-col h-[70vh]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              Support Assistant
            </DialogTitle>
             <DialogDescription>
              Your AI-powered guide to the InsightConnect Portal.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-4">
             <div className="space-y-6">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex items-start gap-3",
                            message.role === 'user' && "justify-end"
                        )}
                    >
                        {message.role === 'bot' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><Sparkles /></AvatarFallback>
                            </Avatar>
                        )}
                         <div
                            className={cn(
                                "max-w-[75%] rounded-lg p-3 text-sm",
                                message.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                        >
                            {message.content}
                        </div>
                        {message.role === 'user' && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || ''} />
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
             </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1"
                />
                <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
