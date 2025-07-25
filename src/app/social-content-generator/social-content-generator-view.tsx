
'use client';

import { generateSocialContent } from '@/ai/flows/social-content-generator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Loader2, User, Share2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const platforms = [
  { value: 'Twitter', label: 'Twitter' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
];

export function SocialContentGeneratorView() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('Twitter');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setContent('');

    try {
      const result = await generateSocialContent({ prompt, platform });
      setContent(result.content);
    } catch (error) {
      console.error('Error generating social content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the content. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'The social post has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Social Content Generator
        </h1>
        <p className="text-muted-foreground">
          Draft posts for various social media platforms.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Prompt
              </CardTitle>
              <CardDescription>
                Describe the post you want to create and select the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Announce a summer sale with a 20% discount on all products."
                    className="h-40 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-select">Platform</Label>
                  <Select
                    value={platform}
                    onValueChange={setPlatform}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="platform-select">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isLoading || !prompt.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Content
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-6 w-6 text-primary" /> Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                readOnly
                placeholder="The generated social media post will appear here..."
                className="h-56 resize-none bg-muted/50"
              />
            </CardContent>
            {content && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy content</span>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
