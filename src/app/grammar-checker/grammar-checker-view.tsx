
'use client';

import { checkGrammar } from '@/ai/flows/check-grammar';
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
import { Clipboard, Loader2, FileCheck, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function GrammarCheckerView() {
  const [text, setText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setCorrectedText('');

    try {
      const result = await checkGrammar({ text });
      setCorrectedText(result.correctedText);
    } catch (error) {
      console.error('Error checking grammar:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to check the text. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedText);
    toast({
      title: 'Copied!',
      description: 'The corrected text has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Grammar & Style Checker
        </h1>
        <p className="text-muted-foreground">
          Improve your writing with AI-powered corrections.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col-reverse">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-6 w-6" /> Your Text
                </CardTitle>
                <CardDescription>
                  Paste the text you want to check.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="text-to-check" className="sr-only">
                      Text to check
                    </Label>
                    <Textarea
                      id="text-to-check"
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
                    Check Text
                  </Button>
                </form>
              </CardContent>
            </Card>
        </div>

        <div className="flex flex-col">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-6 w-6 text-primary" /> Corrected Text
                </CardTitle>
                <CardDescription>
                  Here is the corrected version of your text.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={correctedText}
                  readOnly
                  placeholder="Corrections will appear here..."
                  className="h-64 resize-none bg-muted/50"
                />
              </CardContent>
              {correctedText && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={handleCopy}
                >
                  <Clipboard className="h-4 w-4" />
                  <span className="sr-only">Copy corrected text</span>
                </Button>
              )}
            </Card>
        </div>
      </div>
    </div>
  );
}
