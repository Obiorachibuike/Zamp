
'use client';

import { composeEmail } from '@/ai/flows/compose-email';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Loader2, Sparkles, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function ComposerView() {
  const [prompt, setPrompt] = useState('');
  const [composition, setComposition] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setComposition('');

    try {
      const result = await composeEmail({ prompt });
      setComposition(result.emailDraft);
    } catch (error) {
      console.error('Error composing email:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to compose the message. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(composition);
    toast({
      title: 'Copied!',
      description: 'The composed message has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Email/Message Composer
        </h1>
        <p className="text-muted-foreground">
          Draft professional emails and messages from simple prompts.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col-reverse">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-6 w-6" /> Your Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="prompt">
                      Describe the email or message you want to write.
                    </Label>
                    <Input
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A follow-up email after a job interview"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading || !prompt.trim()}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Compose
                  </Button>
                </form>
              </CardContent>
            </Card>
        </div>

        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> Generated
                Composition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={composition}
                readOnly
                placeholder="Your generated message will appear here..."
                className="h-64 resize-none"
              />
            </CardContent>
            {composition && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy</span>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
