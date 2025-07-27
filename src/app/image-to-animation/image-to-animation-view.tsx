
'use client';

import { imageToAnimation } from '@/ai/flows/image-to-animation';
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
  Image as ImageIcon,
  Loader2,
  Film,
  Upload,
  User,
  Video,
} from 'lucide-react';
import NextImage from 'next/image';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export function ImageToAnimationView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setVideoUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile || !previewUrl || !prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image and provide an animation prompt.',
      });
      return;
    }

    setIsLoading(true);
    setVideoUrl('');

    try {
      const result = await imageToAnimation({ photoDataUri: previewUrl, prompt });
      setVideoUrl(result.video);
    } catch (error: any) {
      console.error('Error generating animation:', error);
      let description = 'Failed to generate the animation. Please try again.';
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
          Image to Animation
        </h1>
        <p className="text-muted-foreground">
          Bring your static images to life with a short animation.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Inputs
              </CardTitle>
              <CardDescription>
                Provide an image and describe the animation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
                 {previewUrl && (
                    <div className="relative mt-4 aspect-square max-w-sm rounded-lg border bg-muted flex items-center justify-center">
                        <NextImage
                        src={previewUrl}
                        alt="Image preview"
                        width={400}
                        height={400}
                        className="rounded-lg object-contain"
                        />
                    </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Animation Prompt</Label>
                   <Input
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., make the clouds drift slowly"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !imageFile || !prompt.trim()}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Animate
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-6 w-6 text-primary" /> Generated Animation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Animating... (this can take a minute)</p>
                  </div>
                )}
                {!isLoading && !videoUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Video className="h-12 w-12" />
                    <p>Your animated image will appear here</p>
                  </div>
                )}
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    muted
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
                <a href={videoUrl} download="animated-image.mp4">
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
