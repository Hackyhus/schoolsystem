
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Sparkles, User, X, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useRole } from '@/context/role-context';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
      
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] flex flex-col z-50 shadow-2xl">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              Support Assistant
            </CardTitle>
             <CardDescription>
              Your AI-powered guide to the portal.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full">
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
                                    <AvatarFallback><Bot /></AvatarFallback>
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
          </CardContent>

          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1"
                />
                <Button type="submit" size="icon" aria-label="Send message">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
