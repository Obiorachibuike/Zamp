
'use client';

import { generateVideo } from '@/ai/flows/generate-video';
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
  Loader2,
  User,
  Video,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function VideoGeneratorView() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setVideoUrl('');

    try {
      const result = await generateVideo({ prompt });
      setVideoUrl(result.video);
    } catch (error: any) {
      console.error('Error generating video:', error);
      let description = 'Failed to generate the video. Please try again later.';
      if (error.message && (error.message.includes('billing') || error.message.includes('FAILED_PRECONDITION'))) {
        description = 'Video generation requires a GCP project with billing enabled. Please check your project configuration.';
      } else if (error.message && error.message.includes('quota')) {
        description = 'You have exceeded your video generation quota. Please try again later.'
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Video Generator
        </h1>
        <p className="text-muted-foreground">
          Create short videos from text descriptions.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Video Prompt
              </CardTitle>
              <CardDescription>
                Describe the video you want to create.
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
                    placeholder="e.g., A majestic dragon soaring over a mystical forest"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !prompt.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Video
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6 text-primary" /> Generated Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Generating video... (this may take a minute)</p>
                  </div>
                )}
                {!isLoading && !videoUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Video className="h-12 w-12" />
                    <p>Your video will appear here</p>
                  </div>
                )}
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            </CardContent>
            {videoUrl && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
              >
                <a href={videoUrl} download={`${prompt.slice(0, 20)}.mp4`}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Video</span>
                </a>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
