
'use client';

import { researchTopic, type ResearchTopicOutput } from '@/ai/flows/researcher';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Loader2, User, Search, Link as LinkIcon, BookOpen } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import NextLink from 'next/link';

export function ResearcherView() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<ResearchTopicOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const researchResult = await researchTopic({ topic });
      setResult(researchResult);
    } catch (error: any) {
      console.error('Error researching topic:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to research the topic. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: 'Copied!',
      description: 'The content has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Researcher
        </h1>
        <p className="text-muted-foreground">
          Enter a topic to get a detailed summary and relevant links.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Research Topic
              </CardTitle>
              <CardDescription>
                Enter the topic you want to research.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The history of artificial intelligence"
                    disabled={isLoading}
                    type="text"
                  />
                </div>
                <Button type="submit" disabled={isLoading || !topic.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Research
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className='flex items-center gap-2'>
                            <Search className="h-6 w-6 text-primary" /> Research Results
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                <ScrollArea className="h-[70vh] w-full rounded-lg border bg-muted p-4">
                    {isLoading && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Researching topic...</p>
                    </div>
                    )}
                    {!isLoading && !result && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Search className="h-12 w-12" />
                        <p className="text-center">Your research results will appear here.</p>
                    </div>
                    )}
                    {result && (
                    <div className="space-y-6">
                        <div>
                            <CardTitle className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-5 w-5" /> Summary
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(result.summary)}>
                                    <Clipboard className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                            <p className="text-sm whitespace-pre-wrap">{result.summary}</p>
                        </div>
                        <div>
                            <CardTitle className="flex items-center gap-2 mb-2">
                                <LinkIcon className="h-5 w-5" /> Links
                            </CardTitle>
                            <div className="space-y-4">
                                {result.links.map((link, index) => (
                                    <div key={index} className="p-3 rounded-md border bg-background">
                                        <NextLink href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                                            {link.title}
                                        </NextLink>
                                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                                        <p className="text-sm mt-1">{link.snippet}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    )}
                </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
