
'use client';

import { humanizeText } from '@/ai/flows/humanizer';
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
import { Clipboard, Feather, Loader2, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function HumanizerView() {
  const [text, setText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setHumanizedText('');

    try {
      const result = await humanizeText({ text });
      setHumanizedText(result.humanizedText);
    } catch (error) {
      console.error('Error humanizing text:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to humanize the text. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(humanizedText);
    toast({
      title: 'Copied!',
      description: 'The humanized text has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Text Humanizer
        </h1>
        <p className="text-muted-foreground">
          Make your AI-generated text sound more natural and engaging.
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
                  Paste the AI-generated text you want to humanize.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="text-to-humanize" className="sr-only">
                      Text to humanize
                    </Label>
                    <Textarea
                      id="text-to-humanize"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your AI-generated text here..."
                      className="h-64 resize-none"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading || !text.trim()}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Humanize Text
                  </Button>
                </form>
              </CardContent>
            </Card>
        </div>

        <div className="flex flex-col">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Feather className="h-6 w-6 text-primary" /> Humanized Text
                </CardTitle>
                <CardDescription>
                  Here is the more natural-sounding version of your text.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={humanizedText}
                  readOnly
                  placeholder="The humanized text will appear here..."
                  className="h-64 resize-none bg-muted/50"
                />
              </CardContent>
              {humanizedText && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={handleCopy}
                >
                  <Clipboard className="h-4 w-4" />
                  <span className="sr-only">Copy humanized text</span>
                </Button>
              )}
            </Card>
        </div>
      </div>
    </div>
  );
}
