
'use client';

import { textToSpeech } from '@/ai/flows/text-to-speech';
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
import { Loader2, Mic, User, Volume2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function TextToSpeechView() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setAudioUrl('');

    try {
      const result = await textToSpeech({ text });
      setAudioUrl(result.audio);
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate audio. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Text-to-Speech
        </h1>
        <p className="text-muted-foreground">
          Convert text into natural-sounding audio.
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
                Enter the text you want to convert to speech.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="text-input" className="sr-only">
                    Text to convert
                  </Label>
                  <Textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g., Hello, world! This is a test."
                    className="h-40 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !text.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Audio
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-6 w-6 text-primary" /> Generated Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 w-full items-center justify-center rounded-lg border bg-muted">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Generating...</p>
                  </div>
                )}
                {!isLoading && !audioUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Volume2 className="h-12 w-12" />
                    <p>Your audio will appear here</p>
                  </div>
                )}
                {audioUrl && (
                  <audio src={audioUrl} controls className="w-full" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
