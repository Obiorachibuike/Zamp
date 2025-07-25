
'use client';

import { chat } from '@/ai/flows/chatbot';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Sparkles, User } from 'lucide-react';
import { useState, useRef, useEffect, type FormEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatbotView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat({ query: input });
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <header className="mb-4 space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Chatbot
        </h1>
        <p className="text-muted-foreground">
          Engage in a conversation with our AI assistant.
        </p>
      </header>
      <div className="flex-1 overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex h-full flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Sparkles className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-md rounded-lg p-3 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p>{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                   <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Sparkles className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse"></span>
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]"></span>
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
