
'use client';

import { analyzeSentiment } from '@/ai/flows/sentiment-analyzer';
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
import {
  Loader2,
  User,
  TrendingUp,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';

export function SentimentAnalyzerView() {
  const [text, setText] = useState('');
  const [sentiment, setSentiment] = useState<
    'Positive' | 'Negative' | 'Neutral' | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setSentiment(null);

    try {
      const result = await analyzeSentiment({ text });
      setSentiment(result.sentiment);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to analyze the text. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'Positive':
        return <Smile className="h-12 w-12 text-green-500" />;
      case 'Negative':
        return <Frown className="h-12 w-12 text-red-500" />;
      case 'Neutral':
        return <Meh className="h-12 w-12 text-yellow-500" />;
      default:
        return <TrendingUp className="h-12 w-12 text-muted-foreground" />;
    }
  };
  
    const getSentimentColor = () => {
    switch (sentiment) {
      case 'Positive':
        return 'text-green-500';
      case 'Negative':
        return 'text-red-500';
      case 'Neutral':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Sentiment Analyzer
        </h1>
        <p className="text-muted-foreground">
          Determine the emotional tone of a piece of text.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Text
              </CardTitle>
              <CardDescription>
                Enter the text you want to analyze.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="text-to-analyze" className="sr-only">
                    Text to analyze
                  </Label>
                  <Textarea
                    id="text-to-analyze"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g., I love using this new app! It's so intuitive."
                    className="h-40 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !text.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Analyze Sentiment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" /> Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border bg-muted">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Analyzing...</p>
                  </div>
                )}
                {!isLoading && sentiment && (
                  <div className="flex flex-col items-center gap-2">
                    {getSentimentIcon()}
                    <p className={cn('text-xl font-semibold', getSentimentColor())}>{sentiment}</p>
                  </div>
                )}
                {!isLoading && !sentiment && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {getSentimentIcon()}
                    <p>Sentiment will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
