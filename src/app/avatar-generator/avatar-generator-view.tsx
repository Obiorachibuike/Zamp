
'use client';

import { generateAvatar } from '@/ai/flows/generate-avatar';
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
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  ImageIcon,
  Loader2,
  Smile,
  User,
} from 'lucide-react';
import NextImage from 'next/image';
import { useState, type FormEvent } from 'react';

export function AvatarGeneratorView() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setImageUrl('');

    try {
      const result = await generateAvatar({ prompt });
      setImageUrl(result.avatar);
    } catch (error) {
      console.error('Error generating avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the avatar. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Avatar Generator
        </h1>
        <p className="text-muted-foreground">
          Create a unique avatar from a text description.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col-reverse">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-6 w-6" /> Avatar Prompt
                </CardTitle>
                <CardDescription>
                  Describe the avatar you want to create.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="prompt">Prompt</Label>
                    <Input
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A smiling robot with a propeller hat"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading || !prompt.trim()}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate
                  </Button>
                </form>
              </CardContent>
            </Card>
        </div>
        <div className="flex flex-col">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-6 w-6 text-primary" /> Generated Avatar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                  {isLoading && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p>Generating...</p>
                    </div>
                  )}
                  {!isLoading && !imageUrl && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-12 w-12" />
                      <p>Your avatar will appear here</p>
                    </div>
                  )}
                  {imageUrl && (
                    <NextImage
                      src={imageUrl}
                      alt={prompt}
                      width={512}
                      height={512}
                      className="rounded-lg object-cover"
                    />
                  )}
                </div>
              </CardContent>
              {imageUrl && (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                >
                  <a href={imageUrl} download={`${prompt.slice(0, 20)}.png`}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download Avatar</span>
                  </a>
                </Button>
              )}
            </Card>
        </div>
      </div>
    </div>
  );
}
