
'use client';

import { generateTalkingPhoto } from '@/ai/flows/talking-photo';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Image as ImageIcon,
  Loader2,
  Mic,
  Play,
  Upload,
  User,
  Video,
} from 'lucide-react';
import NextImage from 'next/image';
import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';

export function TalkingPhotoView() {
  // Input state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState('');

  // Output state
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  // Control state
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setVideoUrl('');
      setAudioUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile || !previewUrl || !text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please upload an image and provide text to speak.',
      });
      return;
    }

    setIsLoading(true);
    setVideoUrl('');
    setAudioUrl('');

    try {
      const result = await generateTalkingPhoto({
        photoDataUri: previewUrl,
        text,
      });
      setVideoUrl(result.video);
      setAudioUrl(result.audio);
    } catch (error: any) {
      console.error('Error generating talking photo:', error);
      let description = 'Failed to generate the video. Please try again later.';
      if (error.message) {
        if (error.message.includes('billing') || error.message.includes('FAILED_PRECONDITION')) {
          description = 'Video generation requires a GCP project with billing enabled. Please check your project configuration.';
        } else if (error.message.includes('quota')) {
          description = 'You have exceeded the generation quota. Please try again later.'
        }
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
  
  const handlePlay = () => {
    videoRef.current?.play();
    audioRef.current?.play();
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Talking Photo
        </h1>
        <p className="text-muted-foreground">
          Upload an image and provide text to make the character speak.
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
                Provide an image and the text to be spoken.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Character Image</Label>
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
                  <Label htmlFor="text">Text to Speak</Label>
                  <Textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the dialogue here..."
                    className="h-24 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !imageFile || !text.trim()}
                >
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
                <Video className="h-6 w-6 text-primary" /> Generated Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Generating... (this can take a minute)</p>
                  </div>
                )}
                {!isLoading && !videoUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-12 w-12" />
                    <p>Your talking photo will appear here</p>
                  </div>
                )}
                {videoUrl && (
                  <>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full rounded-lg"
                      loop
                      muted
                    />
                    <audio ref={audioRef} src={audioUrl} />
                  </>
                )}
              </div>
                {videoUrl && audioUrl && (
                <div className="mt-4 flex justify-center">
                    <Button onClick={handlePlay}>
                        <Play className="mr-2 h-4 w-4" />
                        Play
                    </Button>
                </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
