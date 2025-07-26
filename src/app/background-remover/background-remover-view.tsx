
'use client';

import { removeBackground } from '@/ai/flows/remove-background';
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
import { Download, Image as ImageIcon, Loader2, Scan, User } from 'lucide-react';
import NextImage from 'next/image';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export function BackgroundRemoverView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setResultUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile || !previewUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image file.',
      });
      return;
    }

    setIsLoading(true);
    setResultUrl('');

    try {
      const result = await removeBackground({ photoDataUri: previewUrl });
      setResultUrl(result.image);
    } catch (error: any) {
      console.error('Error removing background:', error);
      let description = 'Failed to remove background. Please try again.';
      if (error.message && error.message.includes('500')) {
        description = 'The image processing service is currently unavailable. Please try again in a few moments.';
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
          Background Remover
        </h1>
        <p className="text-muted-foreground">
          Upload an image to automatically remove its background.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Image
              </CardTitle>
              <CardDescription>
                Upload an image to remove the background.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Image File</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
                {previewUrl && (
                  <div className="mt-4">
                     <NextImage
                      src={previewUrl}
                      alt="Image preview"
                      width={512}
                      height={512}
                      className="rounded-lg object-contain"
                    />
                  </div>
                )}
                <Button type="submit" disabled={isLoading || !imageFile}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Remove Background
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-6 w-6 text-primary" /> Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Processing...</p>
                  </div>
                )}
                {!isLoading && !resultUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-12 w-12" />
                    <p>The result will appear here</p>
                  </div>
                )}
                {resultUrl && (
                  <NextImage
                    src={resultUrl}
                    alt="Image with background removed"
                    width={512}
                    height={512}
                    className="rounded-lg object-contain"
                  />
                )}
              </div>
            </CardContent>
            {resultUrl && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
              >
                <a href={resultUrl} download="background-removed.png">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Image</span>
                </a>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
