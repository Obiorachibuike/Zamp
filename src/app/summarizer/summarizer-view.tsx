
'use client';

import { summarizeText } from '@/ai/flows/summarize-text';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function SummarizerView() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setSummary('');

    try {
      const result = await summarizeText({ text });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error summarizing text:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to summarize the text. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: 'Copied!',
      description: 'The summary has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Text Summarizer
        </h1>
        <p className="text-muted-foreground">
          Get concise summaries of long texts instantly.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Text</CardTitle>
            <CardDescription>
              Paste the text you want to summarize.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="text-to-summarize" className="sr-only">
                  Text to summarize
                </Label>
                <Textarea
                  id="text-to-summarize"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text here..."
                  className="h-64 resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading || !text.trim()}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Summarize
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Here is the AI-generated summary of your text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={summary}
              readOnly
              placeholder="Your summary will appear here..."
              className="h-64 resize-none bg-muted/50"
            />
          </CardContent>
          {summary && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={handleCopy}
            >
              <Clipboard className="h-4 w-4" />
              <span className="sr-only">Copy summary</span>
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
