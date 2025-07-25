
'use client';

import { generateEmailReply } from '@/ai/flows/email-reply-generator';
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
import { Clipboard, Loader2, Mail, Reply, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function EmailReplyGeneratorView() {
  const [originalEmail, setOriginalEmail] = useState('');
  const [replyPrompt, setReplyPrompt] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!originalEmail.trim() || !replyPrompt.trim()) return;

    setIsLoading(true);
    setReplyDraft('');

    try {
      const result = await generateEmailReply({ originalEmail, replyPrompt });
      setReplyDraft(result.replyDraft);
    } catch (error) {
      console.error('Error generating email reply:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the email reply. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyDraft);
    toast({
      title: 'Copied!',
      description: 'The reply draft has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Email Reply Generator
        </h1>
        <p className="text-muted-foreground">
          Generate smart, contextual replies to your emails in seconds.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6" /> Original Email & Prompt
              </CardTitle>
              <CardDescription>
                Paste the email you want to reply to and describe your desired response.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="original-email">Original Email</Label>
                  <Textarea
                    id="original-email"
                    value={originalEmail}
                    onChange={(e) => setOriginalEmail(e.target.value)}
                    placeholder="Paste the email content here..."
                    className="h-40 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-prompt">Reply Instructions</Label>
                   <Textarea
                    id="reply-prompt"
                    value={replyPrompt}
                    onChange={(e) => setReplyPrompt(e.target.value)}
                    placeholder="e.g., Politely decline the invitation and suggest meeting next week."
                    className="h-20 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !originalEmail.trim() || !replyPrompt.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Reply
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Reply className="h-6 w-6 text-primary" /> Generated Reply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={replyDraft}
                readOnly
                placeholder="Your AI-generated reply will appear here..."
                className="h-64 resize-none bg-muted/50"
              />
            </CardContent>
            {replyDraft && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy reply</span>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
