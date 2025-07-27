'use client';

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { chat, type ChatMessage } from '@/ai/flows/chatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageCircle, Send, User, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ChatbotView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: currentMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const result = await chat({ messages: newMessages });
      setMessages([...newMessages, result.message]);
    } catch (error: any) {
      console.error('Error in chat:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get a response. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="space-y-8">
       <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Chatbot
        </h1>
        <p className="text-muted-foreground">
          Have a conversation with a knowledgeable AI assistant.
        </p>
      </header>
      <Card className="h-[80vh] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" /> Chat
          </CardTitle>
          <CardDescription>
            The chatbot has access to Google Search for up-to-date information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={cn(
                            'flex items-start gap-4',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {msg.role === 'model' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Sparkles /></AvatarFallback>
                                </Avatar>
                            )}
                            <div
                            className={cn(
                                'max-w-xs rounded-lg px-4 py-2 text-sm md:max-w-md',
                                msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                            >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                             {msg.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4 justify-start">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback><Sparkles /></AvatarFallback>
                            </Avatar>
                            <div className="max-w-xs rounded-lg px-4 py-2 text-sm bg-muted flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !currentMessage.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
